import calendar
import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.db.types import pg_enum


class TacheStatut(str, enum.Enum):
    EN_COURS = "en_cours"
    TERMINEE = "terminee"
    EN_RETARD = "en_retard"


TRIMESTRE_MOIS = {
    1: [1, 2, 3],
    2: [4, 5, 6],
    3: [7, 8, 9],
    4: [10, 11, 12],
}


def end_of_week_in_month(year: int, month: int, week: int) -> date:
    last_day = calendar.monthrange(year, month)[1]
    day = min(week * 7, last_day)
    return date(year, month, day)


class Tache(Base):
    __tablename__ = "taches"
    __table_args__ = (
        CheckConstraint("trimestre BETWEEN 1 AND 4", name="ck_tache_trimestre"),
        CheckConstraint("ponderation > 0 AND ponderation <= 100", name="ck_tache_ponderation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    activite_id: Mapped[int] = mapped_column(
        ForeignKey("activites.id", ondelete="CASCADE"), nullable=False
    )
    tache_plan_id: Mapped[int | None] = mapped_column(
        ForeignKey("taches_plan.id", ondelete="SET NULL"), nullable=True
    )
    trimestre: Mapped[int] = mapped_column(Integer, nullable=False)
    annee: Mapped[int] = mapped_column(Integer, default=2025, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    responsable: Mapped[str] = mapped_column(String(100), nullable=False)
    email_responsable: Mapped[str | None] = mapped_column(String(255))
    ponderation: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    statut: Mapped[TacheStatut] = mapped_column(
        pg_enum(TacheStatut, "tache_statut"), default=TacheStatut.EN_COURS, nullable=False
    )
    observation: Mapped[str | None] = mapped_column(Text)
    fichier_path: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    semaines: Mapped[list["TacheSemaine"]] = relationship(
        back_populates="tache", cascade="all, delete-orphan"
    )
    fichiers: Mapped[list["TacheFichier"]] = relationship(
        back_populates="tache", cascade="all, delete-orphan"
    )


class TacheSemaine(Base):
    __tablename__ = "tache_semaines"
    __table_args__ = (
        UniqueConstraint("tache_id", "mois", "semaine"),
        CheckConstraint("mois BETWEEN 1 AND 12", name="ck_semaine_mois"),
        CheckConstraint("semaine BETWEEN 1 AND 4", name="ck_semaine_num"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tache_id: Mapped[int] = mapped_column(
        ForeignKey("taches.id", ondelete="CASCADE"), nullable=False
    )
    mois: Mapped[int] = mapped_column(Integer, nullable=False)
    semaine: Mapped[int] = mapped_column(Integer, nullable=False)
    planifie: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    date_fin_semaine: Mapped[date | None] = mapped_column(Date)

    tache: Mapped["Tache"] = relationship(back_populates="semaines")


class TacheFichier(Base):
    __tablename__ = "tache_fichiers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tache_id: Mapped[int] = mapped_column(
        ForeignKey("taches.id", ondelete="CASCADE"), nullable=False
    )
    nom_original: Mapped[str] = mapped_column(String(255), nullable=False)
    chemin_stockage: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str | None] = mapped_column(String(100))
    taille: Mapped[int | None] = mapped_column(Integer)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    tache: Mapped["Tache"] = relationship(back_populates="fichiers")


class NotificationEmail(Base):
    __tablename__ = "notifications_email"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tache_id: Mapped[int | None] = mapped_column(
        ForeignKey("taches.id", ondelete="SET NULL")
    )
    destinataire: Mapped[str] = mapped_column(String(255), nullable=False)
    sujet: Mapped[str | None] = mapped_column(String(255))
    envoye_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    statut: Mapped[str] = mapped_column(String(20), default="envoye")
