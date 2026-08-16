from datetime import UTC, datetime

from app.core.timezone import format_time_guinea, to_guinea_time


def test_format_time_guinea_from_utc():
    value = datetime(2026, 8, 14, 15, 30, tzinfo=UTC)
    assert format_time_guinea(value) == "15:30"
    assert to_guinea_time(value).hour == 15


def test_format_time_guinea_from_offset():
    from datetime import timezone, timedelta

    # 11:30 à Montréal (UTC-4) = 15:30 à Conakry (UTC+0)
    montreal = timezone(timedelta(hours=-4))
    value = datetime(2026, 8, 14, 11, 30, tzinfo=montreal)
    assert format_time_guinea(value) == "15:30"
