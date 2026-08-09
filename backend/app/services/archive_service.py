from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.archive import Dossier, FichierArchive
from app.schemas.archive import (
    ArchiveRootRead,
    BreadcrumbItem,
    DossierContentRead,
    DossierDeletePreview,
    DossierRead,
    FichierArchiveRead,
)
from app.services.storage_service import storage_service


async def _collect_descendant_dossier_ids(db: AsyncSession, root_id: int) -> list[int]:
    ids = {root_id}
    queue = [root_id]
    while queue:
        current = queue.pop()
        result = await db.execute(select(Dossier.id).where(Dossier.parent_id == current))
        for child_id in result.scalars():
            if child_id not in ids:
                ids.add(child_id)
                queue.append(child_id)
    return list(ids)


async def _build_breadcrumb(db: AsyncSession, dossier: Dossier) -> list[BreadcrumbItem]:
    chain: list[BreadcrumbItem] = []
    current: Dossier | None = dossier
    while current is not None:
        chain.append(BreadcrumbItem(id=current.id, nom=current.nom))
        if current.parent_id is None:
            break
        current = await db.get(Dossier, current.parent_id)
    chain.reverse()
    return chain


async def get_archive_root(db: AsyncSession) -> ArchiveRootRead:
    dossiers_result = await db.execute(
        select(Dossier).where(Dossier.parent_id.is_(None)).order_by(Dossier.nom)
    )
    fichiers_result = await db.execute(
        select(FichierArchive)
        .where(FichierArchive.dossier_id.is_(None))
        .order_by(FichierArchive.nom)
    )
    return ArchiveRootRead(
        dossiers=[DossierRead.model_validate(d) for d in dossiers_result.scalars()],
        fichiers=[FichierArchiveRead.model_validate(f) for f in fichiers_result.scalars()],
    )


async def get_dossier_content(db: AsyncSession, dossier_id: int) -> DossierContentRead:
    dossier = await db.get(Dossier, dossier_id)
    if dossier is None:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    sous_result = await db.execute(
        select(Dossier).where(Dossier.parent_id == dossier_id).order_by(Dossier.nom)
    )
    fichiers_result = await db.execute(
        select(FichierArchive)
        .where(FichierArchive.dossier_id == dossier_id)
        .order_by(FichierArchive.nom)
    )

    return DossierContentRead(
        dossier=DossierRead.model_validate(dossier),
        breadcrumb=await _build_breadcrumb(db, dossier),
        sous_dossiers=[DossierRead.model_validate(d) for d in sous_result.scalars()],
        fichiers=[FichierArchiveRead.model_validate(f) for f in fichiers_result.scalars()],
    )


async def create_dossier(
    db: AsyncSession, nom: str, parent_id: int | None
) -> DossierRead:
    if parent_id is not None:
        parent = await db.get(Dossier, parent_id)
        if parent is None:
            raise HTTPException(status_code=404, detail="Dossier parent introuvable")

    dossier = Dossier(nom=nom, parent_id=parent_id)
    db.add(dossier)
    await db.commit()
    await db.refresh(dossier)
    return DossierRead.model_validate(dossier)


async def rename_dossier(db: AsyncSession, dossier_id: int, nom: str) -> DossierRead:
    dossier = await db.get(Dossier, dossier_id)
    if dossier is None:
        raise HTTPException(status_code=404, detail="Dossier introuvable")
    dossier.nom = nom
    await db.commit()
    await db.refresh(dossier)
    return DossierRead.model_validate(dossier)


async def get_dossier_delete_preview(
    db: AsyncSession, dossier_id: int
) -> DossierDeletePreview:
    dossier = await db.get(Dossier, dossier_id)
    if dossier is None:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    dossier_ids = await _collect_descendant_dossier_ids(db, dossier_id)
    sous_total = len(dossier_ids) - 1

    direct_sous = await db.scalar(
        select(func.count()).select_from(Dossier).where(Dossier.parent_id == dossier_id)
    )
    fichiers_directs = await db.scalar(
        select(func.count())
        .select_from(FichierArchive)
        .where(FichierArchive.dossier_id == dossier_id)
    )
    fichiers_total = await db.scalar(
        select(func.count())
        .select_from(FichierArchive)
        .where(FichierArchive.dossier_id.in_(dossier_ids))
    )

    sous_dossiers_directs = direct_sous or 0
    fichiers_directs_count = fichiers_directs or 0
    fichiers_total_count = fichiers_total or 0

    return DossierDeletePreview(
        nom=dossier.nom,
        est_vide=sous_total == 0 and fichiers_total_count == 0,
        sous_dossiers_directs=sous_dossiers_directs,
        sous_dossiers_total=sous_total,
        fichiers_directs=fichiers_directs_count,
        fichiers_total=fichiers_total_count,
    )


async def delete_dossier(db: AsyncSession, dossier_id: int) -> None:
    dossier = await db.get(Dossier, dossier_id)
    if dossier is None:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    dossier_ids = await _collect_descendant_dossier_ids(db, dossier_id)
    fichiers_result = await db.execute(
        select(FichierArchive).where(FichierArchive.dossier_id.in_(dossier_ids))
    )
    for fichier in fichiers_result.scalars().all():
        storage_service.try_delete_file(fichier.chemin_stockage)

    remaining = set(dossier_ids)
    while remaining:
        leaf_ids: list[int] = []
        for did in remaining:
            child_count = await db.scalar(
                select(func.count())
                .select_from(Dossier)
                .where(Dossier.parent_id == did, Dossier.id.in_(remaining))
            )
            if not child_count:
                leaf_ids.append(did)
        for lid in leaf_ids:
            to_delete = await db.get(Dossier, lid)
            if to_delete is not None:
                await db.delete(to_delete)
            remaining.remove(lid)

    await db.commit()


async def upload_fichier(
    db: AsyncSession,
    file: UploadFile,
    dossier_id: int | None,
    uploaded_by: int | None,
) -> FichierArchiveRead:
    if dossier_id is not None:
        dossier = await db.get(Dossier, dossier_id)
        if dossier is None:
            raise HTTPException(status_code=404, detail="Dossier introuvable")

    chemin, nom_original, taille = await storage_service.save_upload(file, "archive")
    fichier = FichierArchive(
        nom=nom_original,
        chemin_stockage=chemin,
        dossier_id=dossier_id,
        mime_type=file.content_type,
        taille=taille,
        uploaded_by=uploaded_by,
    )
    db.add(fichier)
    await db.commit()
    await db.refresh(fichier)
    return FichierArchiveRead.model_validate(fichier)


async def get_fichier_archive(db: AsyncSession, fichier_id: int) -> FichierArchive:
    fichier = await db.get(FichierArchive, fichier_id)
    if fichier is None:
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    return fichier


async def delete_fichier_archive(db: AsyncSession, fichier_id: int) -> None:
    fichier = await get_fichier_archive(db, fichier_id)
    storage_service.try_delete_file(fichier.chemin_stockage)
    await db.delete(fichier)
    await db.commit()
