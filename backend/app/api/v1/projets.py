from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.modules import ProjetCreate, ProjetRead, ProjetType, ProjetUpdate
from app.services import modules_service as service

router = APIRouter()


@router.get("/projets", response_model=list[ProjetRead])
async def list_projets(
    statut: str | None = Query(default=None),
    type_projet: ProjetType | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ProjetRead]:
    return await service.list_projets(db, statut, type_projet)


@router.get("/projets/{item_id}", response_model=ProjetRead)
async def get_projet(
    item_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProjetRead:
    item = await service.get_projet(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    return ProjetRead.model_validate(item)


@router.post("/projets", response_model=ProjetRead, status_code=status.HTTP_201_CREATED)
async def create_projet(
    body: ProjetCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> ProjetRead:
    return await service.create_projet(db, body)


@router.put("/projets/{item_id}", response_model=ProjetRead)
async def update_projet(
    item_id: int,
    body: ProjetUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> ProjetRead:
    item = await service.get_projet(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    return await service.update_projet(db, item, body)


@router.delete("/projets/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_projet(
    item_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await service.get_projet(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    await service.delete_projet(db, item)
