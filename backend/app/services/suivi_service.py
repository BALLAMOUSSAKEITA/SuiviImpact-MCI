from decimal import Decimal

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.direction import Direction
from app.models.plan_action import Activite, ActiviteDirection, ActiviteTrimestre
from app.models.tache import Tache, TacheFichier, TacheStatut
from app.schemas.suivi import SuiviActiviteRead, TacheDetailsRead
from app.services.planification_service import get_tache, tache_to_read
from app.services.storage_service import storage_service


async def list_suivi(
    db: AsyncSession,
    annee: int,
    trimestre: int,
    direction_code: str | None = None,
) -> list[SuiviActiviteRead]:
    query = (
        select(Activite)
        .join(ActiviteTrimestre, Activite.id == ActiviteTrimestre.activite_id)
        .where(
            ActiviteTrimestre.annee == annee,
            ActiviteTrimestre.trimestre == trimestre,
            ActiviteTrimestre.planifie.is_(True),
        )
        .options(selectinload(Activite.directions))
        .order_by(Activite.code)
    )

    if direction_code:
        query = (
            query.join(ActiviteDirection, Activite.id == ActiviteDirection.activite_id)
            .join(Direction, ActiviteDirection.direction_id == Direction.id)
            .where(Direction.code == direction_code)
        )

    result = await db.execute(query)
    activites = result.scalars().unique().all()

    stats: dict[int, tuple[int, int, int]] = {}
    if activites:
        activite_ids = [a.id for a in activites]
        detail_result = await db.execute(
            select(Tache.activite_id, Tache.statut, func.count(Tache.id))
            .where(
                Tache.activite_id.in_(activite_ids),
                Tache.annee == annee,
                Tache.trimestre == trimestre,
            )
            .group_by(Tache.activite_id, Tache.statut)
        )
        for activite_id, statut, count in detail_result.all():
            total, terminees, en_retard = stats.get(activite_id, (0, 0, 0))
            total += count
            if statut == TacheStatut.TERMINEE:
                terminees = count
            elif statut == TacheStatut.EN_RETARD:
                en_retard = count
            stats[activite_id] = (total, terminees, en_retard)

    return [
        SuiviActiviteRead(
            id=a.id,
            code=a.code,
            description=a.description,
            execution=a.execution,
            budget=a.budget,
            objectif_id=a.objectif_id,
            direction_ids=[d.direction_id for d in a.directions],
            nb_taches=stats.get(a.id, (0, 0, 0))[0],
            nb_terminees=stats.get(a.id, (0, 0, 0))[1],
            nb_en_retard=stats.get(a.id, (0, 0, 0))[2],
        )
        for a in activites
    ]


async def list_suivi_by_code(db: AsyncSession, code: str) -> list[SuiviActiviteRead]:
    result = await db.execute(
        select(Activite)
        .where(Activite.code == code)
        .options(selectinload(Activite.directions))
    )
    activite = result.scalar_one_or_none()
    if activite is None:
        return []

    stats_result = await db.execute(
        select(Tache.statut, func.count(Tache.id))
        .where(Tache.activite_id == activite.id)
        .group_by(Tache.statut)
    )
    nb_taches = 0
    nb_terminees = 0
    nb_en_retard = 0
    for statut, count in stats_result.all():
        nb_taches += count
        if statut == TacheStatut.TERMINEE:
            nb_terminees = count
        elif statut == TacheStatut.EN_RETARD:
            nb_en_retard = count

    return [
        SuiviActiviteRead(
            id=activite.id,
            code=activite.code,
            description=activite.description,
            execution=activite.execution,
            budget=activite.budget,
            objectif_id=activite.objectif_id,
            direction_ids=[d.direction_id for d in activite.directions],
            nb_taches=nb_taches,
            nb_terminees=nb_terminees,
            nb_en_retard=nb_en_retard,
        )
    ]


async def list_taches_suivi(
    db: AsyncSession,
    annee: int,
    trimestre: int,
    activite_id: int,
) -> list:
    from app.services.planification_service import list_taches_by_activite

    activite = await db.get(Activite, activite_id)
    if activite is None:
        raise HTTPException(status_code=404, detail="Activité introuvable")
    return await list_taches_by_activite(db, activite_id, trimestre, annee)


async def finaliser_tache(
    db: AsyncSession,
    tache_id: int,
    observation: str | None,
    file: UploadFile | None,
) -> TacheDetailsRead:
    tache = await get_tache(db, tache_id)
    if tache is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    if tache.statut == TacheStatut.TERMINEE:
        raise HTTPException(status_code=400, detail="Tâche déjà finalisée")

    if file is not None:
        chemin, nom_original, taille = await storage_service.save_upload(file, "taches")
        db.add(
            TacheFichier(
                tache_id=tache.id,
                nom_original=nom_original,
                chemin_stockage=chemin,
                mime_type=file.content_type,
                taille=taille,
            )
        )
        tache.fichier_path = chemin

    tache.statut = TacheStatut.TERMINEE
    if observation:
        tache.observation = observation

    activite = await db.get(Activite, tache.activite_id)
    if activite is not None:
        activite.execution = min(
            Decimal("100"),
            activite.execution + tache.ponderation,
        )

    await db.commit()
    return await get_tache_details(db, tache_id)


async def get_tache_details(db: AsyncSession, tache_id: int) -> TacheDetailsRead:
    result = await db.execute(
        select(Tache, Activite)
        .join(Activite, Tache.activite_id == Activite.id)
        .where(Tache.id == tache_id)
        .options(selectinload(Tache.semaines), selectinload(Tache.fichiers))
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")

    tache, activite = row
    base = tache_to_read(tache)
    return TacheDetailsRead(
        **base.model_dump(),
        activite_code=activite.code,
        activite_description=activite.description,
    )


async def get_fichier(db: AsyncSession, fichier_id: int) -> TacheFichier:
    fichier = await db.get(TacheFichier, fichier_id)
    if fichier is None:
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    return fichier
