from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.core.config import settings
from app.services import email_service


def test_resolve_email_provider_prefers_resend_when_both_configured(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "auto")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.example.com")
    assert email_service.resolve_email_provider() == "resend"


def test_resolve_email_provider_smtp_only(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "auto")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.example.com")
    assert email_service.resolve_email_provider() == "smtp"


def test_resolve_email_provider_skips_smtp_on_railway(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "auto")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setenv("RAILWAY_ENVIRONMENT", "production")
    assert email_service.resolve_email_provider() is None
    monkeypatch.delenv("RAILWAY_ENVIRONMENT", raising=False)


def test_get_email_status_warns_on_railway_without_resend(monkeypatch):
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setenv("RAILWAY_PROJECT_ID", "proj")
    status = email_service.get_email_status()
    assert status["configured"] is False
    assert status["railway"] is True
    assert "RESEND_API_KEY" in str(status["message"])
    monkeypatch.delenv("RAILWAY_PROJECT_ID", raising=False)


@pytest.mark.asyncio
async def test_send_email_via_resend(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_PROVIDER", "resend")
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test")
    monkeypatch.setattr(settings, "SMTP_FROM", "SuiviImpact <onboarding@resend.dev>")
    monkeypatch.setattr(settings, "SMTP_HOST", "")

    mock_response = httpx.Response(200, json={"id": "email_123"}, request=httpx.Request("POST", "x"))
    mock_post = AsyncMock(return_value=mock_response)

    with patch("app.services.email_service.httpx.AsyncClient") as client_cls:
        client_cls.return_value.__aenter__.return_value.post = mock_post
        sent = await email_service.send_email(
            ["dest@test.gn"],
            "Sujet test",
            "Corps texte",
            "<p>Corps html</p>",
            cc=["bsd@test.gn"],
        )

    assert sent is True
    mock_post.assert_awaited_once()
    payload = mock_post.await_args.kwargs["json"]
    assert payload["to"] == ["dest@test.gn"]
    assert payload["cc"] == ["bsd@test.gn"]
