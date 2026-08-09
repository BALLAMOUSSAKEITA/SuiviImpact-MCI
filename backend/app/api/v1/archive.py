from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.archive import (
    ArchiveRootRead,
    DossierContentRead,
    DossierCreate,
    DossierDeletePreview,
    DossierRead,
    DossierRename,
    FichierArchiveRead,
)
from app.services import archive_service as service
from app.services.storage_service import storage_service

router = APIRouter()


@router.get("/archive", response_model=ArchiveRootRead)
async def get_archive_root(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ArchiveRootRead:
    return await service.get_archive_root(db)


@router.get("/archive/dossiers/{dossier_id}", response_model=DossierContentRead)
async def get_dossier_content(
    dossier_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DossierContentRead:
    return await service.get_dossier_content(db, dossier_id)


@router.post(
    "/archive/dossiers",
    response_model=DossierRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_dossier(
    body: DossierCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> DossierRead:
    return await service.create_dossier(db, body.nom, body.parent_id)


@router.patch("/archive/dossiers/{dossier_id}", response_model=DossierRead)
async def rename_dossier(
    dossier_id: int,
    body: DossierRename,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> DossierRead:
    return await service.rename_dossier(db, dossier_id, body.nom)


@router.get(
    "/archive/dossiers/{dossier_id}/delete-preview",
    response_model=DossierDeletePreview,
)
async def get_dossier_delete_preview(
    dossier_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> DossierDeletePreview:
    return await service.get_dossier_delete_preview(db, dossier_id)


@router.delete("/archive/dossiers/{dossier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dossier(
    dossier_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_dossier(db, dossier_id)


@router.post(
    "/archive/fichiers",
    response_model=FichierArchiveRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_fichier(
    file: UploadFile = File(...),
    dossier_id: int | None = Form(default=None),
    user: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> FichierArchiveRead:
    return await service.upload_fichier(db, file, dossier_id, user.id)


@router.get("/archive/fichiers/{fichier_id}/download")
async def download_fichier_archive(
    fichier_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    fichier = await service.get_fichier_archive(db, fichier_id)
    path = storage_service.resolve_path(fichier.chemin_stockage)
    return FileResponse(
        path=path,
        filename=fichier.nom,
        media_type=fichier.mime_type or "application/octet-stream",
    )


@router.delete("/archive/fichiers/{fichier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fichier_archive(
    fichier_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_fichier_archive(db, fichier_id)
