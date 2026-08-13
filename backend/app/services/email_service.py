"""Envoi d'e-mails transactionnels (SMTP local, Resend HTTPS sur Railway)."""

from __future__ import annotations

import asyncio
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


def running_on_railway() -> bool:
    return bool(
        os.environ.get("RAILWAY_ENVIRONMENT")
        or os.environ.get("RAILWAY_PROJECT_ID")
        or os.environ.get("RAILWAY_SERVICE_ID")
    )


def smtp_configured() -> bool:
    return bool(settings.SMTP_HOST.strip())


def resend_configured() -> bool:
    return bool(settings.RESEND_API_KEY.strip())


def email_configured() -> bool:
    return resolve_email_provider() is not None


def resolve_email_provider() -> str | None:
    """Retourne 'resend', 'smtp' ou None si aucun canal utilisable."""
    provider = settings.EMAIL_PROVIDER.strip().lower()

    if provider == "resend":
        return "resend" if resend_configured() else None
    if provider == "smtp":
        if running_on_railway():
            logger.warning(
                "SMTP explicitement demandé sur Railway — la connexion sortante est "
                "souvent bloquée."
            )
        return "smtp" if smtp_configured() else None

    if resend_configured():
        return "resend"
    if smtp_configured() and not running_on_railway():
        return "smtp"
    return None


def get_email_status() -> dict[str, str | bool | None]:
    provider = resolve_email_provider()
    railway = running_on_railway()

    if provider == "resend":
        message = "Envoi via Resend (HTTPS)."
    elif provider == "smtp":
        message = "Envoi via SMTP."
    elif railway and smtp_configured() and not resend_configured():
        message = (
            "Railway bloque le SMTP sortant. Supprimez SMTP_HOST et ajoutez "
            "EMAIL_PROVIDER=resend avec RESEND_API_KEY."
        )
    elif railway:
        message = "Configurez EMAIL_PROVIDER=resend et RESEND_API_KEY sur Railway."
    else:
        message = "Aucun canal e-mail configuré — envois simulés."

    return {
        "provider": provider,
        "configured": provider is not None,
        "railway": railway,
        "resend_configured": resend_configured(),
        "smtp_configured": smtp_configured(),
        "message": message,
    }


def get_bsd_cc_emails() -> list[str]:
    return settings.smtp_bsd_cc


def _normalize_recipients(value: str | list[str]) -> list[str]:
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    return [item.strip() for item in value if item and item.strip()]


def _send_smtp_sync(
    destinataires: list[str],
    sujet: str,
    corps_texte: str,
    corps_html: str,
    cc: list[str] | None = None,
) -> None:
    cc_list = cc or []
    message = MIMEMultipart("alternative")
    message["Subject"] = sujet
    message["From"] = settings.SMTP_FROM
    message["To"] = ", ".join(destinataires)
    if cc_list:
        message["Cc"] = ", ".join(cc_list)
    message.attach(MIMEText(corps_texte, "plain", "utf-8"))
    message.attach(MIMEText(corps_html, "html", "utf-8"))

    all_recipients = destinataires + cc_list
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
            if settings.SMTP_USER:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, all_recipients, message.as_string())
    except OSError as exc:
        if getattr(exc, "errno", None) == 101:
            logger.error(
                "Connexion SMTP impossible (réseau bloqué). Sur Railway, utilisez "
                "EMAIL_PROVIDER=resend et RESEND_API_KEY au lieu de SMTP_HOST."
            )
        raise


async def _send_via_resend(
    destinataires: list[str],
    sujet: str,
    corps_texte: str,
    corps_html: str,
    cc: list[str] | None = None,
) -> None:
    payload: dict[str, object] = {
        "from": settings.SMTP_FROM,
        "to": destinataires,
        "subject": sujet,
        "html": corps_html,
        "text": corps_texte,
    }
    if cc:
        payload["cc"] = cc

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if response.status_code >= 400:
            detail = response.text[:500]
            raise RuntimeError(f"Resend HTTP {response.status_code}: {detail}")


async def send_email(
    destinataires: str | list[str],
    sujet: str,
    corps_texte: str,
    corps_html: str,
    *,
    cc: list[str] | None = None,
) -> bool:
    """Envoie un e-mail. Retourne True si envoyé, False si aucun canal configuré."""
    to_list = _normalize_recipients(destinataires)
    cc_list = _normalize_recipients(cc or [])
    if not to_list:
        raise ValueError("Au moins un destinataire est requis")

    provider = resolve_email_provider()
    if provider is None:
        logger.warning(
            "E-mail non configuré — envoi simulé pour %s (Cc: %s) : %s",
            ", ".join(to_list),
            ", ".join(cc_list) if cc_list else "—",
            sujet,
        )
        return False

    try:
        if provider == "resend":
            await _send_via_resend(
                to_list,
                sujet,
                corps_texte,
                corps_html,
                cc_list or None,
            )
        else:
            await asyncio.to_thread(
                _send_smtp_sync,
                to_list,
                sujet,
                corps_texte,
                corps_html,
                cc_list or None,
            )
        logger.info(
            "E-mail envoyé via %s à %s (Cc: %s) : %s",
            provider,
            ", ".join(to_list),
            ", ".join(cc_list) if cc_list else "—",
            sujet,
        )
        return True
    except Exception:
        logger.exception(
            "Échec envoi e-mail (%s) à %s (Cc: %s) : %s",
            provider,
            ", ".join(to_list),
            ", ".join(cc_list) if cc_list else "—",
            sujet,
        )
        raise


def build_activite_retard_email(
    *,
    activite_code: str,
    activite_description: str,
    date_fin: str,
    taches_non_validees: list[tuple[str, str, str]],
) -> tuple[str, str, str]:
    """Construit sujet + corps texte + corps HTML pour un rappel d'activité en retard."""
    sujet = f"SuiviImpact — Activité en retard : {activite_code}"

    lignes_taches = []
    for description, responsable, ponderation in taches_non_validees:
        lignes_taches.append(
            f"- {description} (responsable : {responsable}, pondération : {ponderation} %)"
        )

    if lignes_taches:
        bloc_taches_texte = "\n".join(lignes_taches)
        items_html = "".join(
            f"<li><strong>{description}</strong> — responsable : {responsable}, "
            f"pondération : {ponderation} %</li>"
            for description, responsable, ponderation in taches_non_validees
        )
    else:
        bloc_taches_texte = "- (aucune tâche enregistrée)"
        items_html = "<li>(aucune tâche enregistrée)</li>"

    corps_texte = f"""Madame, Monsieur,

L'activité « {activite_description} » (code {activite_code}) est en retard.
La date de fin prévue ({date_fin}) est dépassée, alors que le Bureau de Stratégie et de Développement (BSD) n'a pas encore validé l'ensemble des tâches de suivi.

Tâches non encore validées par le BSD :
{bloc_taches_texte}

Merci de prendre les mesures nécessaires pour régulariser la situation.

—
SuiviImpact — MIC
"""

    corps_html = f"""<!DOCTYPE html>
<html lang="fr">
<body style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
  <p>Madame, Monsieur,</p>
  <p>
    L'activité <strong>« {activite_description} »</strong> (code <strong>{activite_code}</strong>)
    est <strong style="color: #b91c1c;">en retard</strong>.
  </p>
  <p>
    La date de fin prévue (<strong>{date_fin}</strong>) est dépassée, alors que le
    <strong>Bureau de Stratégie et de Développement (BSD)</strong> n'a pas encore validé
    l'ensemble des tâches de suivi.
  </p>
  <p><strong>Tâches non encore validées par le BSD :</strong></p>
  <ul>{items_html}</ul>
  <p>Merci de prendre les mesures nécessaires pour régulariser la situation.</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
  <p style="color: #666; font-size: 12px;">SuiviImpact — MIC</p>
</body>
</html>"""

    return sujet, corps_texte, corps_html
