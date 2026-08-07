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


class Objectif(Base):
    __tablename__ = "objectifs"
    __table_args__ = (UniqueConstraint("code"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    activites: Mapped[list["Activite"]] = relationship(
        back_populates="objectif", cascade="all, delete-orphan"
    )


class TachePlan(Base):
    __tablename__ = "taches_plan"
    __table_args__ = (UniqueConstraint("code"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Activite(Base):
    __tablename__ = "activites"
    __table_args__ = (
        CheckConstraint("execution >= 0 AND execution <= 100", name="ck_execution_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    objectif_id: Mapped[int] = mapped_column(
        ForeignKey("objectifs.id", ondelete="CASCADE"), nullable=False
    )
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    budget: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    execution: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    date_debut: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_fin: Mapped[date | None] = mapped_column(Date, nullable=True)
    email_responsable: Mapped[str | None] = mapped_column(String(255))
    email_ministre: Mapped[str | None] = mapped_column(String(255))
    tdr_chemin: Mapped[str | None] = mapped_column(String(500))
    tdr_nom_original: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    objectif: Mapped["Objectif"] = relationship(back_populates="activites")
    trimestres: Mapped[list["ActiviteTrimestre"]] = relationship(
        back_populates="activite", cascade="all, delete-orphan"
    )
    directions: Mapped[list["ActiviteDirection"]] = relationship(
        back_populates="activite", cascade="all, delete-orphan"
    )


class ActiviteTrimestre(Base):
    __tablename__ = "activite_trimestres"
    __table_args__ = (
        UniqueConstraint("activite_id", "annee", "trimestre"),
        CheckConstraint("annee BETWEEN 2025 AND 2027", name="ck_trimestre_annee"),
        CheckConstraint("trimestre BETWEEN 1 AND 4", name="ck_trimestre_num"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    activite_id: Mapped[int] = mapped_column(
        ForeignKey("activites.id", ondelete="CASCADE"), nullable=False
    )
    annee: Mapped[int] = mapped_column(Integer, nullable=False)
    trimestre: Mapped[int] = mapped_column(Integer, nullable=False)
    planifie: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    activite: Mapped["Activite"] = relationship(back_populates="trimestres")


class ActiviteDirection(Base):
    __tablename__ = "activite_directions"

    activite_id: Mapped[int] = mapped_column(
        ForeignKey("activites.id", ondelete="CASCADE"), primary_key=True
    )
    direction_id: Mapped[int] = mapped_column(
        ForeignKey("directions.id"), primary_key=True
    )

    activite: Mapped["Activite"] = relationship(back_populates="directions")
