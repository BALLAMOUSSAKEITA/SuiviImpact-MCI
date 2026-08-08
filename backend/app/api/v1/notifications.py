from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.notifications import EmailConfigRead, NotificationEmailRead, RappelActivitesStats
from app.services.email_service import get_email_status
from app.services.notification_service import list_notification_emails
from app.services.reminder_service import check_activite_delays_and_notify

router = APIRouter()


@router.get("/notifications", response_model=list[NotificationEmailRead])
async def get_notifications(
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_write_access),
) -> list[NotificationEmailRead]:
    return await list_notification_emails(db, limit=limit)


@router.get("/notifications/email-config", response_model=EmailConfigRead)
async def get_email_config(
    _: User = Depends(require_write_access),
) -> EmailConfigRead:
    return EmailConfigRead.model_validate(get_email_status())


@router.post("/notifications/rappels-activites", response_model=RappelActivitesStats)
async def envoyer_rappels_activites(
    force: bool = Query(
        default=False,
        description="Ignorer la limite d'un rappel par activité et par jour",
    ),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_write_access),
) -> RappelActivitesStats:
    stats = await check_activite_delays_and_notify(db, force=force)
    return RappelActivitesStats(**stats)
