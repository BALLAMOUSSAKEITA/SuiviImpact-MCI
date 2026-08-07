from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.direction import Direction
from app.models.user import User
from app.schemas.plan_action import (
    ActiviteCreate,
    ActiviteRead,
    ActiviteUpdate,
    DirectionCreate,
    DirectionRead,
    DirectionUpdate,
    ObjectifCreate,
    ObjectifRead,
    ObjectifUpdate,
    TachePlanCreate,
    TachePlanRead,
    TachePlanUpdate,
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


@router.post(
    "/directions",
    response_model=DirectionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_direction(
    body: DirectionCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> Direction:
    direction = Direction(
        code=body.code.strip().upper(),
        libelle=body.libelle.strip(),
        directeur_nom=body.directeur_nom.strip(),
        email_directeur=body.email_directeur.strip(),
    )
    db.add(direction)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Une direction avec cet acronyme existe déjà",
        ) from exc
    await db.refresh(direction)
    return direction


@router.put("/directions/{direction_id}", response_model=DirectionRead)
async def update_direction(
    direction_id: int,
    body: DirectionUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> Direction:
    direction = await db.get(Direction, direction_id)
    if direction is None:
        raise HTTPException(status_code=404, detail="Direction introuvable")
    if body.code is not None:
        direction.code = body.code.strip().upper()
    if body.libelle is not None:
        direction.libelle = body.libelle.strip()
    if body.directeur_nom is not None:
        direction.directeur_nom = body.directeur_nom.strip()
    if body.email_directeur is not None:
        direction.email_directeur = body.email_directeur.strip()
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Une direction avec cet acronyme existe déjà",
        ) from exc
    await db.refresh(direction)
    return direction


@router.get("/objectifs", response_model=list[ObjectifRead])
async def list_objectifs(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ObjectifRead]:
    return await service.list_objectifs(db)


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


@router.get("/taches-plan", response_model=list[TachePlanRead])
async def list_taches_plan(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TachePlanRead]:
    return await service.list_taches_plan(db)


@router.get("/taches-plan/{tache_id}", response_model=TachePlanRead)
async def get_tache_plan(
    tache_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TachePlanRead:
    tache = await service.get_tache_plan(db, tache_id)
    if tache is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return tache


@router.post("/taches-plan", response_model=TachePlanRead, status_code=status.HTTP_201_CREATED)
async def create_tache_plan(
    body: TachePlanCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> TachePlanRead:
    return await service.create_tache_plan(db, body)


@router.put("/taches-plan/{tache_id}", response_model=TachePlanRead)
async def update_tache_plan(
    tache_id: int,
    body: TachePlanUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> TachePlanRead:
    tache = await service.get_tache_plan(db, tache_id)
    if tache is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return await service.update_tache_plan(db, tache, body)


@router.delete("/taches-plan/{tache_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tache_plan(
    tache_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    tache = await service.get_tache_plan(db, tache_id)
    if tache is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    await service.delete_tache_plan(db, tache)


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
