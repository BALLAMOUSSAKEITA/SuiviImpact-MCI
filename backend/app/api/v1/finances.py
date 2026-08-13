from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.finance import FinanceStateRead
from app.services import finance_service as service

router = APIRouter()


@router.get("/finances", response_model=FinanceStateRead)
async def get_finances(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FinanceStateRead:
    return await service.get_state(db)


@router.post("/finances/import", response_model=FinanceStateRead)
async def import_finances(
    file: UploadFile = File(...),
    user: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> FinanceStateRead:
    return await service.import_excel(db, file, user.id)
