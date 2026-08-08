from datetime import date
from typing import Literal

from fastapi import HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.years import MAX_ANNEE, MIN_ANNEE
from app.services import stats_service as service
from app.services.period_filter import PeriodMode

PeriodQuery = tuple[PeriodMode, int, date | None, date | None, str | None]


def period_query_params(
    mode: PeriodMode = Query("annee"),
    annee: int = Query(default=settings.DEFAULT_ANNEE, ge=MIN_ANNEE, le=MAX_ANNEE),
    du: date | None = Query(None),
    au: date | None = Query(None),
    mois: str | None = Query(None),
) -> PeriodQuery:
    return mode, annee, du, au, mois


async def stats_with_period(
    db: AsyncSession,
    handler,
    period: PeriodQuery,
    **kwargs,
):
    mode, annee, du, au, mois = period
    try:
        return await handler(
            db,
            mode=mode,
            annee=annee,
            du=du,
            au=au,
            mois=mois,
            **kwargs,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
