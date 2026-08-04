from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.modules import IndicateurCreate, IndicateurRead, IndicateurUpdate
from app.services import modules_service as service

router = APIRouter()


@router.get("/indicateurs", response_model=list[IndicateurRead])
async def list_indicateurs(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[IndicateurRead]:
    return await service.list_indicateurs(db)


@router.get("/indicateurs/{item_id}", response_model=IndicateurRead)
async def get_indicateur(
    item_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IndicateurRead:
    item = await service.get_indicateur(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Indicateur introuvable")
    return IndicateurRead.model_validate(item)


@router.post(
    "/indicateurs",
    response_model=IndicateurRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_indicateur(
    body: IndicateurCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> IndicateurRead:
    return await service.create_indicateur(db, body)


@router.put("/indicateurs/{item_id}", response_model=IndicateurRead)
async def update_indicateur(
    item_id: int,
    body: IndicateurUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> IndicateurRead:
    item = await service.get_indicateur(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Indicateur introuvable")
    return await service.update_indicateur(db, item, body)


@router.delete("/indicateurs/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_indicateur(
    item_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await service.get_indicateur(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Indicateur introuvable")
    await service.delete_indicateur(db, item)
