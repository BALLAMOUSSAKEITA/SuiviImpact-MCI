from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.period_params import PeriodQuery, period_query_params, stats_with_period
from app.core.database import get_db
from app.models.user import User
from app.schemas.stats import ActiviteStats, ExecutionStats, PpmStats, ProjetStats
from app.services import stats_service as service

router = APIRouter()


@router.get("/stats/activites", response_model=ActiviteStats)
async def stats_activites(
    period: Annotated[PeriodQuery, Depends(period_query_params)],
    direction: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActiviteStats:
    return await stats_with_period(
        db,
        service.stats_activites,
        period,
        direction_code=direction,
    )


@router.get("/stats/recommandations", response_model=ExecutionStats)
async def stats_recommandations(
    period: Annotated[PeriodQuery, Depends(period_query_params)],
    trimestre: int | None = Query(default=None, ge=1, le=4),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExecutionStats:
    return await stats_with_period(
        db,
        service.stats_recommandations,
        period,
        trimestre=trimestre,
    )


@router.get("/stats/missions", response_model=ExecutionStats)
async def stats_missions(
    period: Annotated[PeriodQuery, Depends(period_query_params)],
    trimestre: int | None = Query(default=None, ge=1, le=4),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExecutionStats:
    return await stats_with_period(
        db,
        service.stats_missions,
        period,
        trimestre=trimestre,
    )


@router.get("/stats/ppm", response_model=PpmStats)
async def stats_ppm(
    period: Annotated[PeriodQuery, Depends(period_query_params)],
    type: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PpmStats:
    return await stats_with_period(
        db,
        service.stats_ppm,
        period,
        type_marche=type,
    )


@router.get("/stats/projets", response_model=ProjetStats)
async def stats_projets(
    period: Annotated[PeriodQuery, Depends(period_query_params)],
    projet_id: int | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProjetStats:
    return await stats_with_period(
        db,
        service.stats_projets,
        period,
        projet_id=projet_id,
    )
