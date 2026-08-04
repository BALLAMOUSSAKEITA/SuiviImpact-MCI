from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.modules import PpmStatut
from app.models.user import User
from app.schemas.modules import PpmCreate, PpmRead, PpmUpdate
from app.services import modules_service as service

router = APIRouter()


@router.get("/ppm", response_model=list[PpmRead])
async def list_ppm(
    type: str | None = Query(default=None),
    statut: PpmStatut | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PpmRead]:
    return await service.list_ppm(db, type, statut)


@router.get("/ppm/{item_id}", response_model=PpmRead)
async def get_ppm(
    item_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PpmRead:
    item = await service.get_ppm(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Marché PPM introuvable")
    return PpmRead.model_validate(item)


@router.post("/ppm", response_model=PpmRead, status_code=status.HTTP_201_CREATED)
async def create_ppm(
    body: PpmCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> PpmRead:
    return await service.create_ppm(db, body)


@router.put("/ppm/{item_id}", response_model=PpmRead)
async def update_ppm(
    item_id: int,
    body: PpmUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> PpmRead:
    item = await service.get_ppm(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Marché PPM introuvable")
    return await service.update_ppm(db, item, body)


@router.delete("/ppm/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ppm(
    item_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await service.get_ppm(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Marché PPM introuvable")
    await service.delete_ppm(db, item)
