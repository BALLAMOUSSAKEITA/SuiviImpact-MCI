from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services import export_service as service

router = APIRouter()


def _excel_response(buffer, filename: str) -> StreamingResponse:
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/exports/activites")
async def export_activites(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    buffer = await service.export_activites(db)
    return _excel_response(buffer, "Activites_Trimestres.xlsx")


@router.get("/exports/taches")
async def export_taches(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    buffer = await service.export_taches(db)
    return _excel_response(buffer, "Taches_Trimestres.xlsx")


@router.get("/exports/recommandations")
async def export_recommandations(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    buffer = await service.export_recommandations(db)
    return _excel_response(buffer, "Recommandations_RCC.xlsx")


@router.get("/exports/missions")
async def export_missions(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    buffer = await service.export_missions(db)
    return _excel_response(buffer, "missions.xlsx")


@router.get("/exports/ppm")
async def export_ppm(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    buffer = await service.export_ppm(db)
    return _excel_response(buffer, "marches_ppm.xlsx")


@router.get("/exports/projets")
async def export_projets(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    buffer = await service.export_projets(db)
    return _excel_response(buffer, "projets.xlsx")
