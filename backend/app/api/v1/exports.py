from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.years import MAX_ANNEE, MIN_ANNEE
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


@router.get("/exports/pao")
async def export_pao(
    mode: Literal["annee", "plage", "mois"] = Query(
        "annee",
        description="annee = année calendaire ; plage = du/au ; mois = liste AAAA-MM",
    ),
    annee: int = Query(default=settings.DEFAULT_ANNEE, ge=MIN_ANNEE, le=MAX_ANNEE),
    du: date | None = Query(None, description="Début de plage (date de début activité)"),
    au: date | None = Query(None, description="Fin de plage (date de début activité)"),
    mois: str | None = Query(
        None,
        description="Mois cibles, ex. 2026-01,2026-06 (filtre sur date_debut)",
    ),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    try:
        buffer, filename = await service.export_pao(
            db,
            mode=mode,
            annee=annee,
            du=du,
            au=au,
            mois=mois,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return _excel_response(buffer, filename)


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
