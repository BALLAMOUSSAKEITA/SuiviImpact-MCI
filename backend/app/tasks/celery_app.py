from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "suiviimpact",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.reminders"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Conakry",
    enable_utc=True,
    beat_schedule={
        "check-task-delays-daily": {
            "task": "app.tasks.reminders.check_task_delays",
            "schedule": crontab(hour=8, minute=0),
        },
    },
)
