"""Pass éphémère pour QR de pointage (fenêtre temporelle HMAC)."""

from __future__ import annotations

import hashlib
import hmac
import time

DEFAULT_QR_TTL_SECONDS = 20
MIN_QR_TTL_SECONDS = 5
MAX_QR_TTL_SECONDS = 300


def clamp_qr_ttl(seconds: int) -> int:
    return max(MIN_QR_TTL_SECONDS, min(MAX_QR_TTL_SECONDS, seconds))


def _window(ts: float, ttl: int) -> int:
    return int(ts // ttl)


def _pass_for_window(secret: str, seance_token: str, window: int) -> str:
    raw = hmac.new(
        secret.encode(),
        f"presence-qr:{seance_token}:{window}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return raw[:20]


def generate_qr_pass(
    secret: str,
    seance_token: str,
    ttl: int,
    *,
    ts: float | None = None,
) -> tuple[str, int]:
    """Retourne (pass, secondes avant expiration)."""
    ttl = clamp_qr_ttl(ttl)
    now = ts if ts is not None else time.time()
    window = _window(now, ttl)
    pass_code = _pass_for_window(secret, seance_token, window)
    expires_in = int((window + 1) * ttl - now)
    return pass_code, max(1, expires_in)


def validate_qr_pass(
    secret: str,
    seance_token: str,
    pass_code: str,
    ttl: int,
    *,
    ts: float | None = None,
    grace_windows: int = 1,
) -> bool:
    if not pass_code:
        return False
    ttl = clamp_qr_ttl(ttl)
    now = ts if ts is not None else time.time()
    window = _window(now, ttl)
    for w in range(window - grace_windows, window + 1):
        expected = _pass_for_window(secret, seance_token, w)
        if hmac.compare_digest(expected, pass_code):
            return True
    return False
