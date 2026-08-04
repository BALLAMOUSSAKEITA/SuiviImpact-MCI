from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import AccessType, User, UserRole


async def seed_admin_user(db: AsyncSession) -> None:
    result = await db.execute(
        select(User).where(User.username == settings.ADMIN_USERNAME)
    )
    if result.scalar_one_or_none() is not None:
        return

    admin = User(
        username=settings.ADMIN_USERNAME,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        prenom=settings.ADMIN_PRENOM,
        role=UserRole.ADMIN,
        type_acces=AccessType.ECRITURE,
        etat=True,
    )
    db.add(admin)
    await db.commit()
