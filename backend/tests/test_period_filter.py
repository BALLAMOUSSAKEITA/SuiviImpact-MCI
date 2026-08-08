"""Tests unitaires pour period_filter."""

from datetime import date

from app.services.period_filter import build_period_on_date

from app.models.plan_action import Activite


def test_annee_mode_same_as_plage_calendar():
    col = Activite.date_debut
    cond_year, _ = build_period_on_date(
        col, "annee", annee=2026, du=None, au=None, mois_csv=None
    )
    cond_plage, _ = build_period_on_date(
        col,
        "plage",
        annee=2026,
        du=date(2026, 1, 1),
        au=date(2026, 12, 31),
        mois_csv=None,
    )
    assert str(cond_year) == str(cond_plage)
