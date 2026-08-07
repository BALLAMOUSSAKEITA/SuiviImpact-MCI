from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.parametrage import MinistreParametrageRead, MinistreParametrageUpdate
from app.services import parametrage_service as service

router = APIRouter()


@router.get("/parametrage/ministre", response_model=MinistreParametrageRead)
async def get_ministre_parametrage(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MinistreParametrageRead:
    return await service.get_ministre_parametrage(db)


@router.put("/parametrage/ministre", response_model=MinistreParametrageRead)
async def update_ministre_parametrage(
    body: MinistreParametrageUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> MinistreParametrageRead:
    return await service.update_ministre_parametrage(db, body)
