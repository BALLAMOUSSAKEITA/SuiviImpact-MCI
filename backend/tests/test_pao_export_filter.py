import pytest

from app.services.pao_export_filter import parse_mois_param


def test_parse_mois_param():
    assert parse_mois_param("2025-01,2025-06") == [(2025, 1), (2025, 6)]


def test_parse_mois_param_invalid():
    with pytest.raises(ValueError):
        parse_mois_param("")

    with pytest.raises(ValueError):
        parse_mois_param("2025-13")
