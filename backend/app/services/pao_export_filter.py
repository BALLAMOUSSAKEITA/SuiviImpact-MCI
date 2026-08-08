"""Filtres de période pour l'export PAO (critère : date de début de l'activité)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal

from sqlalchemy import ColumnElement, and_, extract, or_
from sqlalchemy.sql.elements import BooleanClauseList

from app.models.plan_action import Activite

PaoExportMode = Literal["annee", "plage", "mois"]


@dataclass(frozen=True)
class PaoExportPeriod:
    subtitle: str
    filename_part: str


def parse_mois_param(mois: str) -> list[tuple[int, int]]:
    """Parse « 2025-01,2026-03 » en paires (année, mois)."""
    out: list[tuple[int, int]] = []
    for part in mois.split(","):
        token = part.strip()
        if not token:
            continue
        if len(token) != 7 or token[4] != "-":
            raise ValueError(f"Mois invalide : {token!r} (attendu AAAA-MM)")
        year_s, month_s = token.split("-", 1)
        year, month = int(year_s), int(month_s)
        if year < 2025 or year > 2027:
            raise ValueError(f"Année hors plage : {year}")
        if month < 1 or month > 12:
            raise ValueError(f"Mois invalide : {month}")
        out.append((year, month))
    if not out:
        raise ValueError("Sélectionnez au moins un mois")
    return out


def build_date_debut_condition(
    mode: PaoExportMode,
    *,
    annee: int,
    du: date | None,
    au: date | None,
    mois_csv: str | None,
) -> tuple[ColumnElement[bool] | BooleanClauseList, PaoExportPeriod]:
    """
    Une activité est incluse si sa date_debut respecte le filtre choisi.
    """
    if mode == "annee":
        period = PaoExportPeriod(
            subtitle=f"Période : année {annee} (date de début) · SuiviImpact",
            filename_part=f"{annee}",
        )
        return extract("year", Activite.date_debut) == annee, period

    if mode == "plage":
        if du is None or au is None:
            raise ValueError("Les dates de début et de fin sont requises")
        if du > au:
            raise ValueError("La date de début doit être antérieure ou égale à la date de fin")
        period = PaoExportPeriod(
            subtitle=(
                f"Période : du {du.isoformat()} au {au.isoformat()} "
                f"(date de début de l'activité) · SuiviImpact"
            ),
            filename_part=f"{du.isoformat()}_{au.isoformat()}",
        )
        return (
            and_(Activite.date_debut >= du, Activite.date_debut <= au),
            period,
        )

    if mode == "mois":
        if not mois_csv:
            raise ValueError("Sélectionnez au moins un mois")
        pairs = parse_mois_param(mois_csv)
        clauses = [
            and_(
                extract("year", Activite.date_debut) == y,
                extract("month", Activite.date_debut) == m,
            )
            for y, m in pairs
        ]
        labels = ", ".join(f"{m:02d}/{y}" for y, m in sorted(pairs))
        period = PaoExportPeriod(
            subtitle=f"Mois (date de début) : {labels} · SuiviImpact",
            filename_part="mois_" + "_".join(f"{y}-{m:02d}" for y, m in sorted(pairs)[:4])
            + ("_etc" if len(pairs) > 4 else ""),
        )
        return or_(*clauses), period

    raise ValueError(f"Mode d'export inconnu : {mode}")
