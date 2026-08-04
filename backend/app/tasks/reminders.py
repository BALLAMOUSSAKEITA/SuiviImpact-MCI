import asyncio
import logging
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import async_session_maker
from app.models.tache import NotificationEmail, Tache, TacheStatut
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


async def _check_task_delays_async() -> dict[str, int]:
    today = date.today()
    marquees = 0
    emails = 0

    async with async_session_maker() as db:
        result = await db.execute(
            select(Tache)
            .where(Tache.statut == TacheStatut.EN_COURS)
            .options(selectinload(Tache.semaines))
        )
        taches = result.scalars().all()

        for tache in taches:
            en_retard = any(
                s.planifie and s.date_fin_semaine and s.date_fin_semaine < today
                for s in tache.semaines
            )
            if not en_retard:
                continue

            tache.statut = TacheStatut.EN_RETARD
            marquees += 1

            if tache.email_responsable:
                notif = NotificationEmail(
                    tache_id=tache.id,
                    destinataire=tache.email_responsable,
                    sujet=f"Rappel — tâche en retard : {tache.description[:80]}",
                    statut="envoye",
                )
                db.add(notif)
                emails += 1
                logger.info(
                    "Notification retard enregistrée pour tâche %s → %s",
                    tache.id,
                    tache.email_responsable,
                )

        await db.commit()

    return {"marquees": marquees, "emails": emails}


@celery_app.task(name="app.tasks.reminders.check_task_delays")
def check_task_delays() -> dict[str, int]:
    """Parcourt les tâches en cours, marque les retards et enregistre les notifications."""
    return asyncio.run(_check_task_delays_async())
