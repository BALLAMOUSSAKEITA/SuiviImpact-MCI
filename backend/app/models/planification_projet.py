from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PlanificationProjet(Base):
    __tablename__ = "planifications_projet"
    __table_args__ = (
        CheckConstraint(
            "type_budget IN ('BND', 'FINEX')",
            name="ck_planif_projet_type_budget",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    projet_id: Mapped[int] = mapped_column(
        ForeignKey("projets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type_budget: Mapped[str] = mapped_column(String(10), nullable=False)
    montant: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    lieu: Mapped[str] = mapped_column(String(255), nullable=False)
    date_debut: Mapped[date] = mapped_column(Date, nullable=False)
    date_fin: Mapped[date] = mapped_column(Date, nullable=False)
    direction_id: Mapped[int] = mapped_column(
        ForeignKey("directions.id"), nullable=False
    )
    email_responsable: Mapped[str] = mapped_column(String(255), nullable=False)
    email_ministre: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    composantes: Mapped[list["PlanificationProjetComposante"]] = relationship(
        back_populates="planification",
        cascade="all, delete-orphan",
        order_by="PlanificationProjetComposante.ordre",
    )


class PlanificationProjetComposante(Base):
    __tablename__ = "planification_projet_composantes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    planification_id: Mapped[int] = mapped_column(
        ForeignKey("planifications_projet.id", ondelete="CASCADE"), nullable=False
    )
    ordre: Mapped[int] = mapped_column(Integer, nullable=False)
    libelle: Mapped[str | None] = mapped_column(String(255))

    planification: Mapped["PlanificationProjet"] = relationship(
        back_populates="composantes"
    )
    activites: Mapped[list["PlanificationProjetActivite"]] = relationship(
        back_populates="composante",
        cascade="all, delete-orphan",
        order_by="PlanificationProjetActivite.ordre",
    )


class PlanificationProjetActivite(Base):
    __tablename__ = "planification_projet_activites"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    composante_id: Mapped[int] = mapped_column(
        ForeignKey("planification_projet_composantes.id", ondelete="CASCADE"),
        nullable=False,
    )
    ordre: Mapped[int] = mapped_column(Integer, nullable=False)
    titre: Mapped[str] = mapped_column(Text, nullable=False)

    composante: Mapped["PlanificationProjetComposante"] = relationship(
        back_populates="activites"
    )
