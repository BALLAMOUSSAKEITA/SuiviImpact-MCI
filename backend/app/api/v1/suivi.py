from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.planification import TacheRead
from app.schemas.suivi import SuiviActiviteRead, TacheDetailsRead
from app.services import suivi_service as service
from app.services.storage_service import storage_service

router = APIRouter()


@router.get("/suivi/{annee}/{trimestre}", response_model=list[SuiviActiviteRead])
async def list_suivi(
    annee: int,
    trimestre: int,
    direction: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SuiviActiviteRead]:
    return await service.list_suivi(db, annee, trimestre, direction)


@router.get("/suivi/code/{code}", response_model=list[SuiviActiviteRead])
async def list_suivi_by_code(
    code: str,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SuiviActiviteRead]:
    return await service.list_suivi_by_code(db, code)


@router.get(
    "/suivi/{annee}/{trimestre}/activites/{activite_id}/taches",
    response_model=list[TacheRead],
)
async def list_taches_suivi(
    annee: int,
    trimestre: int,
    activite_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TacheRead]:
    return await service.list_taches_suivi(db, annee, trimestre, activite_id)


@router.post("/taches/{tache_id}/finaliser", response_model=TacheDetailsRead)
async def finaliser_tache(
    tache_id: int,
    observation: str | None = Form(default=None),
    fichier: UploadFile | None = File(default=None),
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> TacheDetailsRead:
    return await service.finaliser_tache(db, tache_id, observation, fichier)


@router.get("/taches/{tache_id}/details", response_model=TacheDetailsRead)
async def get_tache_details(
    tache_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TacheDetailsRead:
    return await service.get_tache_details(db, tache_id)


@router.get("/fichiers/{fichier_id}/download")
async def download_fichier(
    fichier_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    fichier = await service.get_fichier(db, fichier_id)
    path = storage_service.resolve_path(fichier.chemin_stockage)
    return FileResponse(
        path=path,
        filename=fichier.nom_original,
        media_type=fichier.mime_type or "application/octet-stream",
    )
