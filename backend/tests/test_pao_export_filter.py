import pytest

from app.services.pao_export_filter import parse_mois_param


def test_parse_mois_param():
    assert parse_mois_param("2026-01,2026-06") == [(2026, 1), (2026, 6)]


def test_parse_mois_param_invalid():
    with pytest.raises(ValueError):
        parse_mois_param("")

    with pytest.raises(ValueError):
        parse_mois_param("2026-13")
