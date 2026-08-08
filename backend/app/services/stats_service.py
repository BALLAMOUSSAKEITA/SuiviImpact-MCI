from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.direction import Direction
from app.models.modules import Mission, Ppm, PpmStatut, Projet, Recommandation
from app.models.plan_action import Activite, ActiviteDirection
from app.models.tache import Tache, TacheStatut
from app.schemas.stats import ActiviteStats, ExecutionStats, PpmStats, ProjetStats
from app.services.period_filter import PeriodMode, build_period_on_date


def _execution_bucket(execution: Decimal) -> str:
    value = float(execution)
    if value == 0:
        return "non_demare"
    if value >= 100:
        return "termine"
    return "en_cours"


def _aggregate_execution(items) -> ExecutionStats:
    counts = {"non_demare": 0, "en_cours": 0, "termine": 0}
    total_execution = Decimal("0")
    for item in items:
        bucket = _execution_bucket(item.execution)
        counts[bucket] += 1
        total_execution += item.execution

    total = len(items)
    progression = (
        (total_execution / total).quantize(Decimal("0.1")) if total else Decimal("0")
    )

    return ExecutionStats(
        total=total,
        non_demare=counts["non_demare"],
        en_cours=counts["en_cours"],
        termine=counts["termine"],
        progression=progression,
    )


async def stats_activites(
    db: AsyncSession,
    direction_code: str | None = None,
    *,
    mode: PeriodMode = "annee",
    annee: int = 2026,
    du: date | None = None,
    au: date | None = None,
    mois: str | None = None,
) -> ActiviteStats:
    date_cond, _ = build_period_on_date(
        Activite.date_debut,
        mode,
        annee=annee,
        du=du,
        au=au,
        mois_csv=mois,
    )

    query = (
        select(Activite)
        .where(
            Activite.date_debut.isnot(None),
            Activite.date_fin.isnot(None),
            date_cond,
        )
        .options(selectinload(Activite.directions))
    )
    if direction_code:
        query = (
            query.join(ActiviteDirection, Activite.id == ActiviteDirection.activite_id)
            .join(Direction, ActiviteDirection.direction_id == Direction.id)
            .where(Direction.code == direction_code)
        )
    result = await db.execute(query)
    activites = result.scalars().unique().all()

    counts = {"non_demare": 0, "en_cours": 0, "termine": 0}
    total_execution = Decimal("0")
    for activite in activites:
        bucket = _execution_bucket(activite.execution)
        counts[bucket] += 1
        total_execution += activite.execution

    activite_ids = [a.id for a in activites]
    en_retard = 0
    if activite_ids:
        retard_result = await db.execute(
            select(func.count(func.distinct(Tache.activite_id))).where(
                Tache.activite_id.in_(activite_ids),
                Tache.statut == TacheStatut.EN_RETARD,
            )
        )
        en_retard = retard_result.scalar_one()

    total = len(activites)
    progression = (
        (total_execution / total).quantize(Decimal("0.1")) if total else Decimal("0")
    )

    return ActiviteStats(
        total=total,
        non_demare=counts["non_demare"],
        en_cours=counts["en_cours"],
        termine=counts["termine"],
        en_retard=en_retard,
        progression=progression,
    )


async def stats_recommandations(
    db: AsyncSession,
    trimestre: int | None = None,
    *,
    mode: PeriodMode = "annee",
    annee: int = 2026,
    du: date | None = None,
    au: date | None = None,
    mois: str | None = None,
) -> ExecutionStats:
    date_cond, _ = build_period_on_date(
        Recommandation.date_recommandation,
        mode,
        annee=annee,
        du=du,
        au=au,
        mois_csv=mois,
        period_context="Date de la recommandation",
    )
    query = select(Recommandation).where(date_cond)
    if trimestre is not None:
        query = query.where(Recommandation.trimestre == trimestre)
    result = await db.execute(query)
    return _aggregate_execution(list(result.scalars().all()))


async def stats_missions(
    db: AsyncSession,
    trimestre: int | None = None,
    *,
    mode: PeriodMode = "annee",
    annee: int = 2026,
    du: date | None = None,
    au: date | None = None,
    mois: str | None = None,
) -> ExecutionStats:
    date_cond, _ = build_period_on_date(
        Mission.date_mission,
        mode,
        annee=annee,
        du=du,
        au=au,
        mois_csv=mois,
        period_context="Date de la mission",
    )
    query = select(Mission).where(date_cond)
    if trimestre is not None:
        query = query.where(Mission.trimestre == trimestre)
    result = await db.execute(query)
    return _aggregate_execution(list(result.scalars().all()))


async def stats_ppm(
    db: AsyncSession,
    type_marche: str | None = None,
    *,
    mode: PeriodMode = "annee",
    annee: int = 2026,
    du: date | None = None,
    au: date | None = None,
    mois: str | None = None,
) -> PpmStats:
    date_cond, _ = build_period_on_date(
        Ppm.date_marche,
        mode,
        annee=annee,
        du=du,
        au=au,
        mois_csv=mois,
        period_context="Date du marché",
    )
    query = select(Ppm.statut, func.count(Ppm.id)).where(
        Ppm.date_marche.isnot(None),
        date_cond,
    )
    if type_marche:
        query = query.where(Ppm.type_marche == type_marche)
    query = query.group_by(Ppm.statut)
    result = await db.execute(query)

    counts = {
        PpmStatut.DAO_ELABORE: 0,
        PpmStatut.DAO_PUBLIE: 0,
        PpmStatut.MARCHE_ATTRIBUE: 0,
        PpmStatut.CONTRAT_SIGNE: 0,
    }
    total = 0
    for statut, count in result.all():
        counts[statut] = count
        total += count

    return PpmStats(
        total=total,
        dao_elabore=counts[PpmStatut.DAO_ELABORE],
        dao_publie=counts[PpmStatut.DAO_PUBLIE],
        marche_attribue=counts[PpmStatut.MARCHE_ATTRIBUE],
        contrat_signe=counts[PpmStatut.CONTRAT_SIGNE],
    )


async def stats_projets(
    db: AsyncSession,
    projet_id: int | None = None,
    *,
    mode: PeriodMode = "annee",
    annee: int = 2026,
    du: date | None = None,
    au: date | None = None,
    mois: str | None = None,
) -> ProjetStats:
    date_cond, _ = build_period_on_date(
        Projet.date_debut,
        mode,
        annee=annee,
        du=du,
        au=au,
        mois_csv=mois,
        period_context="Date de début du projet",
    )
    query = select(Projet).where(Projet.date_debut.isnot(None), date_cond)
    if projet_id is not None:
        query = query.where(Projet.id == projet_id)
    result = await db.execute(query)
    projets = list(result.scalars().all())

    if not projets:
        return ProjetStats(
            total=0,
            execution_financiere=Decimal("0"),
            execution_physique=Decimal("0"),
        )

    fin = sum(p.execution_financiere for p in projets) / len(projets)
    phys = sum(p.execution_physique for p in projets) / len(projets)

    return ProjetStats(
        total=len(projets),
        execution_financiere=fin.quantize(Decimal("0.1")),
        execution_physique=phys.quantize(Decimal("0.1")),
    )
