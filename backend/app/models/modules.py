import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PpmStatut(str, enum.Enum):
    DAO_ELABORE = "dao_elabore"
    DAO_PUBLIE = "dao_publie"
    MARCHE_ATTRIBUE = "marche_attribue"
    CONTRAT_SIGNE = "contrat_signe"


class Recommandation(Base):
    __tablename__ = "recommandations"
    __table_args__ = (
        CheckConstraint("trimestre BETWEEN 1 AND 4", name="ck_reco_trimestre"),
        CheckConstraint("execution >= 0 AND execution <= 100", name="ck_reco_execution"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    trimestre: Mapped[int] = mapped_column(Integer, nullable=False)
    annee: Mapped[int] = mapped_column(Integer, default=2025, nullable=False)
    date_recommandation: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    responsable: Mapped[str] = mapped_column(String(100), nullable=False)
    execution: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    observations: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Mission(Base):
    __tablename__ = "missions"
    __table_args__ = (
        CheckConstraint("trimestre BETWEEN 1 AND 4", name="ck_mission_trimestre"),
        CheckConstraint("execution >= 0 AND execution <= 100", name="ck_mission_execution"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    trimestre: Mapped[int] = mapped_column(Integer, nullable=False)
    annee: Mapped[int] = mapped_column(Integer, default=2025, nullable=False)
    date_mission: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    responsable: Mapped[str] = mapped_column(String(100), nullable=False)
    execution: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    observations: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Ppm(Base):
    __tablename__ = "ppm"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero: Mapped[str | None] = mapped_column(String(20))
    intitule: Mapped[str] = mapped_column(Text, nullable=False)
    type_marche: Mapped[str | None] = mapped_column(String(50))
    mode_passation: Mapped[str | None] = mapped_column(String(100))
    montant_estime: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    montant_attribue: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    financement: Mapped[str | None] = mapped_column(String(50))
    date_marche: Mapped[date | None] = mapped_column(Date)
    statut: Mapped[PpmStatut] = mapped_column(
        Enum(PpmStatut, name="ppm_statut"), default=PpmStatut.DAO_ELABORE, nullable=False
    )
    observations: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Projet(Base):
    __tablename__ = "projets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    abreviation: Mapped[str | None] = mapped_column(String(20))
    cout: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    bailleur: Mapped[str | None] = mapped_column(String(50))
    part_etat: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    part_bailleur: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    execution_financiere: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    execution_physique: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    date_debut: Mapped[date | None] = mapped_column(Date)
    date_fin: Mapped[date | None] = mapped_column(Date)
    observations: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Indicateur(Base):
    __tablename__ = "indicateurs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    libelle: Mapped[str] = mapped_column(Text, nullable=False)
    reference: Mapped[str | None] = mapped_column(String(100))
    cible: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    realise: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
