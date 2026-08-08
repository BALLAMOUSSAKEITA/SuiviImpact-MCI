"""Envoi d'e-mails transactionnels via SMTP."""

from __future__ import annotations

import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool(settings.SMTP_HOST.strip())


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
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
        if settings.SMTP_USER:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, all_recipients, message.as_string())


async def send_email(
    destinataires: str | list[str],
    sujet: str,
    corps_texte: str,
    corps_html: str,
    *,
    cc: list[str] | None = None,
) -> bool:
    """Envoie un e-mail. Retourne True si envoyé, False si SMTP non configuré."""
    to_list = _normalize_recipients(destinataires)
    cc_list = _normalize_recipients(cc or [])
    if not to_list:
        raise ValueError("Au moins un destinataire est requis")

    if not smtp_configured():
        logger.warning(
            "SMTP non configuré — e-mail simulé pour %s (Cc: %s) : %s",
            ", ".join(to_list),
            ", ".join(cc_list) if cc_list else "—",
            sujet,
        )
        return False

    try:
        await asyncio.to_thread(
            _send_smtp_sync,
            to_list,
            sujet,
            corps_texte,
            corps_html,
            cc_list or None,
        )
        logger.info(
            "E-mail envoyé à %s (Cc: %s) : %s",
            ", ".join(to_list),
            ", ".join(cc_list) if cc_list else "—",
            sujet,
        )
        return True
    except Exception:
        logger.exception(
            "Échec envoi e-mail à %s (Cc: %s) : %s",
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
SuiviImpact — Programme MIPME / MCI
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
  <p style="color: #666; font-size: 12px;">SuiviImpact — Programme MIPME / MCI</p>
</body>
</html>"""

    return sujet, corps_texte, corps_html
