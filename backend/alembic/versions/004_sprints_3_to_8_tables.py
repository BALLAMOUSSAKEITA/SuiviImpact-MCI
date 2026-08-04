"""sprints 4-8 tables

Revision ID: 004
Revises: 003
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

from app.db.migration_helpers import drop_enum, ensure_enum

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    ensure_enum("tache_statut", "en_cours", "terminee", "en_retard")
    ensure_enum(
        "ppm_statut",
        "dao_elabore",
        "dao_publie",
        "marche_attribue",
        "contrat_signe",
    )

    tache_statut = postgresql.ENUM(
        "en_cours", "terminee", "en_retard", name="tache_statut", create_type=False
    )
    ppm_statut = postgresql.ENUM(
        "dao_elabore",
        "dao_publie",
        "marche_attribue",
        "contrat_signe",
        name="ppm_statut",
        create_type=False,
    )

    op.create_table(
        "taches",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("activite_id", sa.Integer(), nullable=False),
        sa.Column("trimestre", sa.Integer(), nullable=False),
        sa.Column("annee", sa.Integer(), server_default="2025", nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("responsable", sa.String(100), nullable=False),
        sa.Column("email_responsable", sa.String(255)),
        sa.Column("ponderation", sa.Numeric(5, 2), nullable=False),
        sa.Column("statut", tache_statut, server_default="en_cours", nullable=False),
        sa.Column("observation", sa.Text()),
        sa.Column("fichier_path", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.CheckConstraint("trimestre BETWEEN 1 AND 4"),
        sa.CheckConstraint("ponderation > 0 AND ponderation <= 100"),
        sa.ForeignKeyConstraint(["activite_id"], ["activites.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "tache_semaines",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("tache_id", sa.Integer(), nullable=False),
        sa.Column("mois", sa.Integer(), nullable=False),
        sa.Column("semaine", sa.Integer(), nullable=False),
        sa.Column("planifie", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("date_fin_semaine", sa.Date()),
        sa.CheckConstraint("mois BETWEEN 1 AND 12"),
        sa.CheckConstraint("semaine BETWEEN 1 AND 4"),
        sa.ForeignKeyConstraint(["tache_id"], ["taches.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tache_id", "mois", "semaine"),
    )

    op.create_table(
        "tache_fichiers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("tache_id", sa.Integer(), nullable=False),
        sa.Column("nom_original", sa.String(255), nullable=False),
        sa.Column("chemin_stockage", sa.String(500), nullable=False),
        sa.Column("mime_type", sa.String(100)),
        sa.Column("taille", sa.Integer()),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["tache_id"], ["taches.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "notifications_email",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("tache_id", sa.Integer()),
        sa.Column("destinataire", sa.String(255), nullable=False),
        sa.Column("sujet", sa.String(255)),
        sa.Column("envoye_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("statut", sa.String(20), server_default="envoye"),
        sa.ForeignKeyConstraint(["tache_id"], ["taches.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "recommandations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("trimestre", sa.Integer(), nullable=False),
        sa.Column("annee", sa.Integer(), server_default="2025", nullable=False),
        sa.Column("date_recommandation", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("responsable", sa.String(100), nullable=False),
        sa.Column("execution", sa.Numeric(5, 2), server_default="0"),
        sa.Column("observations", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "missions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("trimestre", sa.Integer(), nullable=False),
        sa.Column("annee", sa.Integer(), server_default="2025", nullable=False),
        sa.Column("date_mission", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("responsable", sa.String(100), nullable=False),
        sa.Column("execution", sa.Numeric(5, 2), server_default="0"),
        sa.Column("observations", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "ppm",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("numero", sa.String(20)),
        sa.Column("intitule", sa.Text(), nullable=False),
        sa.Column("type_marche", sa.String(50)),
        sa.Column("mode_passation", sa.String(100)),
        sa.Column("montant_estime", sa.Numeric(15, 2)),
        sa.Column("montant_attribue", sa.Numeric(15, 2)),
        sa.Column("financement", sa.String(50)),
        sa.Column("date_marche", sa.Date()),
        sa.Column("statut", ppm_statut, server_default="dao_elabore", nullable=False),
        sa.Column("observations", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "projets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("abreviation", sa.String(20)),
        sa.Column("cout", sa.Numeric(15, 2)),
        sa.Column("bailleur", sa.String(50)),
        sa.Column("part_etat", sa.Numeric(5, 2)),
        sa.Column("part_bailleur", sa.Numeric(5, 2)),
        sa.Column("execution_financiere", sa.Numeric(5, 2), server_default="0"),
        sa.Column("execution_physique", sa.Numeric(5, 2), server_default="0"),
        sa.Column("date_debut", sa.Date()),
        sa.Column("date_fin", sa.Date()),
        sa.Column("observations", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "indicateurs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(20), nullable=False),
        sa.Column("libelle", sa.Text(), nullable=False),
        sa.Column("reference", sa.String(100)),
        sa.Column("cible", sa.Numeric(10, 2)),
        sa.Column("realise", sa.Numeric(10, 2), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "dossiers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nom", sa.String(255), nullable=False),
        sa.Column("parent_id", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["parent_id"], ["dossiers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "fichiers_archive",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nom", sa.String(255), nullable=False),
        sa.Column("chemin_stockage", sa.String(500), nullable=False),
        sa.Column("dossier_id", sa.Integer()),
        sa.Column("mime_type", sa.String(100)),
        sa.Column("taille", sa.Integer(), nullable=False),
        sa.Column("uploaded_by", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["dossier_id"], ["dossiers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["uploaded_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("fichiers_archive")
    op.drop_table("dossiers")
    op.drop_table("indicateurs")
    op.drop_table("projets")
    op.drop_table("ppm")
    op.drop_table("missions")
    op.drop_table("recommandations")
    op.drop_table("notifications_email")
    op.drop_table("tache_fichiers")
    op.drop_table("tache_semaines")
    op.drop_table("taches")
    drop_enum("ppm_statut")
    drop_enum("tache_statut")
