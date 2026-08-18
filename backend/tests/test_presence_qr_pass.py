from datetime import UTC, datetime, timedelta, timezone

from app.core.config import settings
from app.services.presence_qr_pass import generate_qr_pass, validate_qr_pass


def test_generate_and_validate_current_window():
    ttl = 20
    ts = datetime(2026, 8, 14, 10, 0, 5, tzinfo=UTC).timestamp()
    qr_pass, expires_in = generate_qr_pass(settings.SECRET_KEY, "seance-token", ttl, ts=ts)
    assert len(qr_pass) == 20
    assert 1 <= expires_in <= ttl
    assert validate_qr_pass(settings.SECRET_KEY, "seance-token", qr_pass, ttl, ts=ts)


def test_expired_pass_rejected():
    ttl = 20
    old_ts = datetime(2026, 8, 14, 10, 0, 5, tzinfo=UTC).timestamp()
    qr_pass, _ = generate_qr_pass(settings.SECRET_KEY, "seance-token", ttl, ts=old_ts)
    later_ts = old_ts + ttl * 3
    assert not validate_qr_pass(settings.SECRET_KEY, "seance-token", qr_pass, ttl, ts=later_ts)


def test_grace_window_accepts_previous():
    ttl = 20
    montreal = timezone(timedelta(hours=-4))
    ts = datetime(2026, 8, 14, 10, 0, 19, tzinfo=montreal).timestamp()
    qr_pass, _ = generate_qr_pass(settings.SECRET_KEY, "token-abc", ttl, ts=ts - 1)
    assert validate_qr_pass(settings.SECRET_KEY, "token-abc", qr_pass, ttl, ts=ts)
