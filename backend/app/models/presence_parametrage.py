"""Paramétrage global du module présence."""

from datetime import datetime

from sqlalchemy import DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

PRESENCE_PARAMETRAGE_ID = 1


class PresenceParametrage(Base):
    __tablename__ = "presence_parametrage"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    qr_ttl_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
