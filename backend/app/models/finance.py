"""Snapshot budgétaire importé depuis Excel (un jeu de lignes à la fois)."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

FINANCE_SNAPSHOT_ID = 1


class FinanceSnapshot(Base):
    __tablename__ = "finance_snapshot"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    imported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    imported_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    row_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class FinanceLigne(Base):
    __tablename__ = "finance_lignes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ordre: Mapped[int] = mapped_column(Integer, nullable=False)
    titre_budget: Mapped[str] = mapped_column(Text, nullable=False)
    montant_prevu: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    montant_engage: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    montant_paye: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    taux_engagement: Mapped[Decimal | None] = mapped_column(Numeric(12, 8))
    taux_caisse: Mapped[Decimal | None] = mapped_column(Numeric(12, 8))
    source_information: Mapped[str | None] = mapped_column(Text)
    is_total: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
