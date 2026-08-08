import asyncio
import logging

from app.core.database import async_session_maker
from app.services.reminder_service import check_activite_delays_and_notify
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


async def _check_task_delays_async() -> dict[str, int]:
    async with async_session_maker() as db:
        stats = await check_activite_delays_and_notify(db)
        logger.info("Rappels activités en retard : %s", stats)
        return stats


@celery_app.task(name="app.tasks.reminders.check_task_delays")
def check_task_delays() -> dict[str, int]:
    """Job quotidien : activités PAO en retard → e-mail ministre + directeur."""
    return asyncio.run(_check_task_delays_async())
