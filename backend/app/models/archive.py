from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Dossier(Base):
    __tablename__ = "dossiers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("dossiers.id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    parent: Mapped["Dossier | None"] = relationship(
        remote_side="Dossier.id", back_populates="enfants"
    )
    enfants: Mapped[list["Dossier"]] = relationship(back_populates="parent")
    fichiers: Mapped[list["FichierArchive"]] = relationship(
        back_populates="dossier", cascade="all, delete-orphan"
    )


class FichierArchive(Base):
    __tablename__ = "fichiers_archive"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nom: Mapped[str] = mapped_column(String(255), nullable=False)
    chemin_stockage: Mapped[str] = mapped_column(String(500), nullable=False)
    dossier_id: Mapped[int | None] = mapped_column(
        ForeignKey("dossiers.id", ondelete="CASCADE")
    )
    mime_type: Mapped[str | None] = mapped_column(String(100))
    taille: Mapped[int] = mapped_column(Integer, nullable=False)
    uploaded_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    dossier: Mapped["Dossier | None"] = relationship(back_populates="fichiers")
