"""Détection des activités PAO en retard et envoi des rappels e-mail."""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable
from datetime import date, datetime, time, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.direction import Direction
from app.models.ministre import MINISTRE_PARAMETRAGE_ID, MinistreParametrage
from app.models.plan_action import Activite
from app.models.tache import NotificationEmail, Tache, TacheStatut
from app.services.email_service import (
    build_activite_retard_email,
    get_bsd_cc_emails,
    send_email,
    smtp_configured,
)

logger = logging.getLogger(__name__)

SendEmailFn = Callable[..., Awaitable[bool]]


async def _get_directeur_email(db: AsyncSession, activite: Activite) -> str | None:
    if activite.email_responsable and activite.email_responsable.strip():
        return activite.email_responsable.strip()

    if not activite.directions:
        return None

    direction_ids = [link.direction_id for link in activite.directions]
    result = await db.execute(
        select(Direction.email_directeur).where(Direction.id.in_(direction_ids))
    )
    for email in result.scalars():
        if email and email.strip():
            return email.strip()
    return None


async def _get_ministre_email(db: AsyncSession, activite: Activite) -> str | None:
    if activite.email_ministre and activite.email_ministre.strip():
        return activite.email_ministre.strip()

    row = await db.get(MinistreParametrage, MINISTRE_PARAMETRAGE_ID)
    if row and row.email and row.email.strip():
        return row.email.strip()
    return None


async def _already_notified_today(
    db: AsyncSession,
    activite_id: int,
    today: date,
) -> bool:
    start = datetime.combine(today, time.min, tzinfo=timezone.utc)
    result = await db.execute(
        select(func.count(NotificationEmail.id)).where(
            NotificationEmail.activite_id == activite_id,
            NotificationEmail.envoye_at >= start,
            NotificationEmail.en_copie.is_(False),
        )
    )
    return (result.scalar_one() or 0) > 0


def _format_ponderation(value: Decimal) -> str:
    normalized = value.normalize()
    text = format(normalized, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text


def _record_notification(
    db: AsyncSession,
    *,
    activite_id: int,
    destinataire: str,
    sujet: str,
    statut: str,
    en_copie: bool,
) -> None:
    db.add(
        NotificationEmail(
            activite_id=activite_id,
            destinataire=destinataire,
            sujet=sujet,
            statut=statut,
            en_copie=en_copie,
        )
    )


async def check_activite_delays_and_notify(
    db: AsyncSession,
    *,
    today: date | None = None,
    force: bool = False,
    send_email_fn: SendEmailFn = send_email,
) -> dict[str, int]:
    """Repère les activités en retard et envoie un rappel au ministre, au directeur et le BSD en copie."""
    reference = today or date.today()
    activites_notifiees = 0
    emails_envoyes = 0
    emails_simules = 0
    emails_echec = 0
    bsd_cc = get_bsd_cc_emails()

    result = await db.execute(
        select(Activite)
        .where(
            Activite.date_fin.isnot(None),
            Activite.date_fin < reference,
        )
        .options(selectinload(Activite.directions))
        .order_by(Activite.code)
    )
    activites = result.scalars().all()

    for activite in activites:
        taches_result = await db.execute(
            select(Tache)
            .where(
                Tache.activite_id == activite.id,
                Tache.statut != TacheStatut.TERMINEE,
            )
            .order_by(Tache.trimestre, Tache.id)
        )
        taches_non_validees = taches_result.scalars().all()
        if not taches_non_validees:
            continue

        if not force and await _already_notified_today(db, activite.id, reference):
            continue

        destinataires: dict[str, str] = {}
        directeur_email = await _get_directeur_email(db, activite)
        ministre_email = await _get_ministre_email(db, activite)

        if directeur_email:
            destinataires[directeur_email.lower()] = directeur_email
        if ministre_email:
            destinataires[ministre_email.lower()] = ministre_email

        if not destinataires:
            logger.warning(
                "Activité %s en retard sans destinataire e-mail configuré",
                activite.code,
            )
            continue

        taches_payload = [
            (
                tache.description,
                tache.responsable,
                _format_ponderation(tache.ponderation),
            )
            for tache in taches_non_validees
        ]
        sujet, corps_texte, corps_html = build_activite_retard_email(
            activite_code=activite.code,
            activite_description=activite.description,
            date_fin=activite.date_fin.isoformat(),
            taches_non_validees=taches_payload,
        )

        statut_base = "envoye" if smtp_configured() else "simule"
        to_list = list(destinataires.values())
        statut = statut_base

        try:
            sent = await send_email_fn(
                to_list,
                sujet,
                corps_texte,
                corps_html,
                cc=bsd_cc,
            )
            if sent:
                emails_envoyes += len(to_list) + len(bsd_cc)
            else:
                emails_simules += len(to_list) + len(bsd_cc)
        except Exception:
            statut = "echec"
            emails_echec += len(to_list) + len(bsd_cc)
            for email in to_list:
                _record_notification(
                    db,
                    activite_id=activite.id,
                    destinataire=email,
                    sujet=sujet,
                    statut=statut,
                    en_copie=False,
                )
            for email in bsd_cc:
                _record_notification(
                    db,
                    activite_id=activite.id,
                    destinataire=email,
                    sujet=sujet,
                    statut=statut,
                    en_copie=True,
                )
            continue

        for email in to_list:
            _record_notification(
                db,
                activite_id=activite.id,
                destinataire=email,
                sujet=sujet,
                statut=statut,
                en_copie=False,
            )
        for email in bsd_cc:
            _record_notification(
                db,
                activite_id=activite.id,
                destinataire=email,
                sujet=sujet,
                statut=statut,
                en_copie=True,
            )

        activites_notifiees += 1
        logger.info(
            "Rappel activité en retard %s → %s (Cc BSD: %s)",
            activite.code,
            ", ".join(to_list),
            ", ".join(bsd_cc) if bsd_cc else "—",
        )

    await db.commit()

    return {
        "activites_notifiees": activites_notifiees,
        "emails_envoyes": emails_envoyes,
        "emails_simules": emails_simules,
        "emails_echec": emails_echec,
    }
