from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.modules import MissionCreate, MissionRead, MissionUpdate, ModuleListResponse
from app.services import modules_service as service

router = APIRouter()


@router.get("/missions", response_model=ModuleListResponse)
async def list_missions(
    trimestre: int | None = Query(default=None, ge=1, le=4),
    annee: int | None = Query(default=None, ge=2025, le=2027),
    statut: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ModuleListResponse:
    return await service.list_missions(db, trimestre, annee, statut)


@router.get("/missions/{item_id}", response_model=MissionRead)
async def get_mission(
    item_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MissionRead:
    item = await service.get_mission(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Mission introuvable")
    return MissionRead.model_validate(item)


@router.post("/missions", response_model=MissionRead, status_code=status.HTTP_201_CREATED)
async def create_mission(
    body: MissionCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> MissionRead:
    return await service.create_mission(db, body)


@router.put("/missions/{item_id}", response_model=MissionRead)
async def update_mission(
    item_id: int,
    body: MissionUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> MissionRead:
    item = await service.get_mission(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Mission introuvable")
    return await service.update_mission(db, item, body)


@router.delete("/missions/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mission(
    item_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await service.get_mission(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Mission introuvable")
    await service.delete_mission(db, item)


@router.patch("/missions/{item_id}/finaliser", response_model=MissionRead)
async def finaliser_mission(
    item_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> MissionRead:
    item = await service.get_mission(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Mission introuvable")
    return await service.finaliser_mission(db, item)
