from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.stats import ActiviteStats, ExecutionStats, PpmStats, ProjetStats
from app.services import stats_service as service

router = APIRouter()


@router.get("/stats/activites", response_model=ActiviteStats)
async def stats_activites(
    direction: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActiviteStats:
    return await service.stats_activites(db, direction)


@router.get("/stats/recommandations", response_model=ExecutionStats)
async def stats_recommandations(
    trimestre: int | None = Query(default=None, ge=1, le=4),
    annee: int = Query(default=settings.DEFAULT_ANNEE, ge=2025, le=2027),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExecutionStats:
    return await service.stats_recommandations(db, trimestre, annee)


@router.get("/stats/missions", response_model=ExecutionStats)
async def stats_missions(
    trimestre: int | None = Query(default=None, ge=1, le=4),
    annee: int = Query(default=settings.DEFAULT_ANNEE, ge=2025, le=2027),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ExecutionStats:
    return await service.stats_missions(db, trimestre, annee)


@router.get("/stats/ppm", response_model=PpmStats)
async def stats_ppm(
    type: str | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PpmStats:
    return await service.stats_ppm(db, type)


@router.get("/stats/projets", response_model=ProjetStats)
async def stats_projets(
    projet_id: int | None = Query(default=None),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProjetStats:
    return await service.stats_projets(db, projet_id)
