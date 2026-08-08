"""Historique et déclenchement des rappels e-mail."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.plan_action import Activite
from app.models.tache import NotificationEmail
from app.schemas.notifications import NotificationEmailRead


async def list_notification_emails(
    db: AsyncSession,
    *,
    limit: int = 100,
) -> list[NotificationEmailRead]:
    capped = max(1, min(limit, 500))
    result = await db.execute(
        select(NotificationEmail, Activite.code, Activite.description)
        .outerjoin(Activite, NotificationEmail.activite_id == Activite.id)
        .order_by(NotificationEmail.envoye_at.desc(), NotificationEmail.id.desc())
        .limit(capped)
    )

    items: list[NotificationEmailRead] = []
    for notif, activite_code, activite_description in result.all():
        items.append(
            NotificationEmailRead(
                id=notif.id,
                activite_id=notif.activite_id,
                activite_code=activite_code,
                activite_description=activite_description,
                destinataire=notif.destinataire,
                sujet=notif.sujet,
                en_copie=notif.en_copie,
                envoye_at=notif.envoye_at,
                statut=notif.statut,
            )
        )
    return items
