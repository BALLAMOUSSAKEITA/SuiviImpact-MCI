"""Filtres de période sur une colonne date (date de début, date mission, etc.)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal

from sqlalchemy import ColumnElement, and_, extract, or_
from sqlalchemy.orm import InstrumentedAttribute

from app.core.years import MAX_ANNEE, MIN_ANNEE

PeriodMode = Literal["annee", "plage", "mois"]


@dataclass(frozen=True)
class PeriodLabel:
    subtitle: str
    filename_part: str


def parse_mois_param(mois: str) -> list[tuple[int, int]]:
    out: list[tuple[int, int]] = []
    for part in mois.split(","):
        token = part.strip()
        if not token:
            continue
        if len(token) != 7 or token[4] != "-":
            raise ValueError(f"Mois invalide : {token!r} (attendu AAAA-MM)")
        year_s, month_s = token.split("-", 1)
        year, month = int(year_s), int(month_s)
        if year < MIN_ANNEE or year > MAX_ANNEE:
            raise ValueError(f"Année hors plage ({MIN_ANNEE}–{MAX_ANNEE}) : {year}")
        if month < 1 or month > 12:
            raise ValueError(f"Mois invalide : {month}")
        out.append((year, month))
    if not out:
        raise ValueError("Sélectionnez au moins un mois")
    return out


def build_period_on_date(
    date_column: InstrumentedAttribute,
    mode: PeriodMode,
    *,
    annee: int,
    du: date | None,
    au: date | None,
    mois_csv: str | None,
    period_context: str = "Période",
) -> tuple[ColumnElement[bool] | or_, PeriodLabel]:
    if annee < MIN_ANNEE or annee > MAX_ANNEE:
        raise ValueError(f"L'année doit être entre {MIN_ANNEE} et {MAX_ANNEE}")

    if mode == "annee":
        du_y = date(annee, 1, 1)
        au_y = date(annee, 12, 31)
        period = PeriodLabel(
            subtitle=f"{period_context} : année {annee}",
            filename_part=f"{annee}",
        )
        return (
            and_(date_column >= du_y, date_column <= au_y),
            period,
        )

    if mode == "plage":
        if du is None or au is None:
            raise ValueError("Les dates de début et de fin sont requises")
        if du > au:
            raise ValueError("La date de début doit être antérieure ou égale à la date de fin")
        if du.year < MIN_ANNEE or au.year > MAX_ANNEE:
            raise ValueError(f"Les dates doivent être entre {MIN_ANNEE} et {MAX_ANNEE}")
        period = PeriodLabel(
            subtitle=f"{period_context} : du {du.isoformat()} au {au.isoformat()}",
            filename_part=f"{du.isoformat()}_{au.isoformat()}",
        )
        return (
            and_(date_column >= du, date_column <= au),
            period,
        )

    if mode == "mois":
        if not mois_csv:
            raise ValueError("Sélectionnez au moins un mois")
        pairs = parse_mois_param(mois_csv)
        clauses = [
            and_(
                extract("year", date_column) == y,
                extract("month", date_column) == m,
            )
            for y, m in pairs
        ]
        labels = ", ".join(f"{m:02d}/{y}" for y, m in sorted(pairs))
        period = PeriodLabel(
            subtitle=f"{period_context} : mois {labels}",
            filename_part="mois_" + "_".join(f"{y}-{m:02d}" for y, m in sorted(pairs)[:4])
            + ("_etc" if len(pairs) > 4 else ""),
        )
        return or_(*clauses), period

    raise ValueError(f"Mode inconnu : {mode}")
