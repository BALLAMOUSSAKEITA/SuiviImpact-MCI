from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.planification import PlanificationActiviteRead, TacheCreate, TacheRead, TacheUpdate
from app.services import planification_service as service

router = APIRouter()


@router.get(
    "/planification/{annee}/{trimestre}",
    response_model=list[PlanificationActiviteRead],
)
async def list_planification(
    annee: int,
    trimestre: int,
    direction: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PlanificationActiviteRead]:
    return await service.list_planification(db, annee, trimestre, direction)


@router.get(
    "/activites/{activite_id}/taches",
    response_model=list[TacheRead],
)
async def list_taches(
    activite_id: int,
    trimestre: int = Query(..., ge=1, le=4),
    annee: int = Query(default=2025, ge=2025, le=2027),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TacheRead]:
    return await service.list_taches_by_activite(db, activite_id, trimestre, annee)


@router.get("/taches/{tache_id}", response_model=TacheRead)
async def get_tache(
    tache_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TacheRead:
    tache = await service.get_tache(db, tache_id)
    if tache is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return service.tache_to_read(tache)


@router.post(
    "/activites/{activite_id}/taches",
    response_model=TacheRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_tache(
    activite_id: int,
    body: TacheCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> TacheRead:
    return await service.create_tache(db, activite_id, body)


@router.put("/taches/{tache_id}", response_model=TacheRead)
async def update_tache(
    tache_id: int,
    body: TacheUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> TacheRead:
    tache = await service.get_tache(db, tache_id)
    if tache is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return await service.update_tache(db, tache, body)


@router.delete("/taches/{tache_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tache(
    tache_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    tache = await service.get_tache(db, tache_id)
    if tache is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    await service.delete_tache(db, tache)
