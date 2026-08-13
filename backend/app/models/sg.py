"""Secrétaire général — fiche unique dans le paramétrage."""

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

SG_PARAMETRAGE_ID = 1


class SgParametrage(Base):
    __tablename__ = "sg_parametrage"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    prenom: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    nom: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
