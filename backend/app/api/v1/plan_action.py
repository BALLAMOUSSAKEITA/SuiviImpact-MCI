from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.direction import Direction
from app.models.plan_action import ObjectifType
from app.models.user import User
from app.schemas.plan_action import (
    ActiviteCreate,
    ActiviteRead,
    ActiviteUpdate,
    DirectionRead,
    ObjectifCreate,
    ObjectifRead,
    ObjectifUpdate,
)
from app.services import plan_action_service as service
from app.services.plan_action_service import activite_to_read

router = APIRouter()


@router.get("/directions", response_model=list[DirectionRead])
async def list_directions(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Direction]:
    result = await db.execute(select(Direction).order_by(Direction.code))
    return list(result.scalars().all())


@router.get("/objectifs", response_model=list[ObjectifRead])
async def list_objectifs(
    type: ObjectifType | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ObjectifRead]:
    return await service.list_objectifs(db, type)


@router.get("/objectifs/{objectif_id}", response_model=ObjectifRead)
async def get_objectif(
    objectif_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ObjectifRead:
    objectif = await service.get_objectif(db, objectif_id)
    if objectif is None:
        raise HTTPException(status_code=404, detail="Objectif introuvable")
    return objectif


@router.post("/objectifs", response_model=ObjectifRead, status_code=status.HTTP_201_CREATED)
async def create_objectif(
    body: ObjectifCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> ObjectifRead:
    return await service.create_objectif(db, body)


@router.put("/objectifs/{objectif_id}", response_model=ObjectifRead)
async def update_objectif(
    objectif_id: int,
    body: ObjectifUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> ObjectifRead:
    objectif = await service.get_objectif(db, objectif_id)
    if objectif is None:
        raise HTTPException(status_code=404, detail="Objectif introuvable")
    return await service.update_objectif(db, objectif, body)


@router.delete("/objectifs/{objectif_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_objectif(
    objectif_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    objectif = await service.get_objectif(db, objectif_id)
    if objectif is None:
        raise HTTPException(status_code=404, detail="Objectif introuvable")
    await service.delete_objectif(db, objectif)


@router.get("/objectifs/{objectif_id}/activites", response_model=list[ActiviteRead])
async def list_activites(
    objectif_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ActiviteRead]:
    objectif = await service.get_objectif(db, objectif_id)
    if objectif is None:
        raise HTTPException(status_code=404, detail="Objectif introuvable")
    return await service.list_activites_by_objectif(db, objectif_id)


@router.post(
    "/objectifs/{objectif_id}/activites",
    response_model=ActiviteRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_activite(
    objectif_id: int,
    body: ActiviteCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> ActiviteRead:
    objectif = await service.get_objectif(db, objectif_id)
    if objectif is None:
        raise HTTPException(status_code=404, detail="Objectif introuvable")
    return await service.create_activite(db, objectif_id, body)


@router.get("/activites", response_model=list[ActiviteRead])
async def list_activites_by_statut(
    statut: str = Query(..., pattern="^(non_demare|en_cours|termine|en_retard)$"),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ActiviteRead]:
    return await service.list_activites_by_statut(db, statut)


@router.get("/activites/{activite_id}", response_model=ActiviteRead)
async def get_activite(
    activite_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActiviteRead:
    activite = await service.get_activite(db, activite_id)
    if activite is None:
        raise HTTPException(status_code=404, detail="Activité introuvable")
    return activite_to_read(activite)


@router.put("/activites/{activite_id}", response_model=ActiviteRead)
async def update_activite(
    activite_id: int,
    body: ActiviteUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> ActiviteRead:
    activite = await service.get_activite(db, activite_id)
    if activite is None:
        raise HTTPException(status_code=404, detail="Activité introuvable")
    return await service.update_activite(db, activite, body)


@router.delete("/activites/{activite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activite(
    activite_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    activite = await service.get_activite(db, activite_id)
    if activite is None:
        raise HTTPException(status_code=404, detail="Activité introuvable")
    await service.delete_activite(db, activite)
