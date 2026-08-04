from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.modules import (
    ModuleListResponse,
    RecommandationCreate,
    RecommandationRead,
    RecommandationUpdate,
)
from app.services import modules_service as service

router = APIRouter()


@router.get("/recommandations", response_model=ModuleListResponse)
async def list_recommandations(
    trimestre: int | None = Query(default=None, ge=1, le=4),
    annee: int | None = Query(default=None, ge=2025, le=2027),
    statut: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ModuleListResponse:
    return await service.list_recommandations(db, trimestre, annee, statut)


@router.get("/recommandations/{item_id}", response_model=RecommandationRead)
async def get_recommandation(
    item_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RecommandationRead:
    item = await service.get_recommandation(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Recommandation introuvable")
    return RecommandationRead.model_validate(item)


@router.post(
    "/recommandations",
    response_model=RecommandationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_recommandation(
    body: RecommandationCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> RecommandationRead:
    return await service.create_recommandation(db, body)


@router.put("/recommandations/{item_id}", response_model=RecommandationRead)
async def update_recommandation(
    item_id: int,
    body: RecommandationUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> RecommandationRead:
    item = await service.get_recommandation(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Recommandation introuvable")
    return await service.update_recommandation(db, item, body)


@router.delete("/recommandations/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recommandation(
    item_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await service.get_recommandation(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Recommandation introuvable")
    await service.delete_recommandation(db, item)


@router.patch("/recommandations/{item_id}/finaliser", response_model=RecommandationRead)
async def finaliser_recommandation(
    item_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> RecommandationRead:
    item = await service.get_recommandation(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Recommandation introuvable")
    return await service.finaliser_recommandation(db, item)
