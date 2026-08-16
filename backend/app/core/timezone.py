"""Fuseau horaire officiel — Guinée (Conakry)."""

from __future__ import annotations

from datetime import UTC, datetime
from zoneinfo import ZoneInfo

GUINEA_TZ = ZoneInfo("Africa/Conakry")


def to_guinea_time(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=UTC)
    return value.astimezone(GUINEA_TZ)


def format_time_guinea(value: datetime) -> str:
    return to_guinea_time(value).strftime("%H:%M")
