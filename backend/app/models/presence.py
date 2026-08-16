import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.types import pg_enum


class SeanceStatut(str, enum.Enum):
    OUVERTE = "ouverte"
    FERMEE = "fermee"


class PersonnelCabinet(Base):
    __tablename__ = "personnel_cabinet"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    num_ordre: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    nom_complet: Mapped[str] = mapped_column(String(200), nullable=False)
    fonction: Mapped[str] = mapped_column(String(500), nullable=False)
    contact: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    categorie: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    code_presence: Mapped[str] = mapped_column(String(4), unique=True, nullable=False)
    actif: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    presences: Mapped[list["PresenceEnregistrement"]] = relationship(
        back_populates="personnel", cascade="all, delete-orphan"
    )


class SeancePresence(Base):
    __tablename__ = "seances_presence"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    titre: Mapped[str] = mapped_column(String(255), nullable=False)
    date_seance: Mapped[date] = mapped_column(Date, nullable=False)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    statut: Mapped[SeanceStatut] = mapped_column(
        pg_enum(SeanceStatut, "seance_statut"),
        default=SeanceStatut.OUVERTE,
        nullable=False,
    )
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    presences: Mapped[list["PresenceEnregistrement"]] = relationship(
        back_populates="seance", cascade="all, delete-orphan"
    )


class PresenceEnregistrement(Base):
    __tablename__ = "presences_enregistrements"
    __table_args__ = (
        UniqueConstraint("seance_id", "personnel_id", name="uq_presence_seance_personnel"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    seance_id: Mapped[int] = mapped_column(
        ForeignKey("seances_presence.id", ondelete="CASCADE"), nullable=False
    )
    personnel_id: Mapped[int] = mapped_column(
        ForeignKey("personnel_cabinet.id", ondelete="CASCADE"), nullable=False
    )
    nom_complet: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    fonction: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    pointe_a: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    seance: Mapped["SeancePresence"] = relationship(back_populates="presences")
    personnel: Mapped["PersonnelCabinet"] = relationship(back_populates="presences")
