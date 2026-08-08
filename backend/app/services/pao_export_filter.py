"""Export PAO — filtre sur date_debut des activités."""

from __future__ import annotations

from datetime import date

from app.models.plan_action import Activite
from app.services.period_filter import PeriodLabel, PeriodMode, build_period_on_date

PaoExportMode = PeriodMode

from app.services.period_filter import parse_mois_param  # noqa: F401 — tests


def build_date_debut_condition(
    mode: PeriodMode,
    *,
    annee: int,
    du: date | None,
    au: date | None,
    mois_csv: str | None,
) -> tuple[object, PeriodLabel]:
    cond, period = build_period_on_date(
        Activite.date_debut,
        mode,
        annee=annee,
        du=du,
        au=au,
        mois_csv=mois_csv,
        period_context="Date de début de l'activité",
    )
    return cond, PeriodLabel(
        subtitle=f"{period.subtitle} · SuiviImpact",
        filename_part=period.filename_part,
    )
