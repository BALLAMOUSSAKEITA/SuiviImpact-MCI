"""planification projet tables

Revision ID: 010
Revises: 009
Create Date: 2026-08-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "010"
down_revision: Union[str, None] = "009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "planifications_projet",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("projet_id", sa.Integer(), nullable=False),
        sa.Column("type_budget", sa.String(10), nullable=False),
        sa.Column("montant", sa.Numeric(15, 2), nullable=False),
        sa.Column("lieu", sa.String(255), nullable=False),
        sa.Column("date_debut", sa.Date(), nullable=False),
        sa.Column("date_fin", sa.Date(), nullable=False),
        sa.Column("direction_id", sa.Integer(), nullable=False),
        sa.Column("email_responsable", sa.String(255), nullable=False),
        sa.Column("email_ministre", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "type_budget IN ('BND', 'FINEX')",
            name="ck_planif_projet_type_budget",
        ),
        sa.ForeignKeyConstraint(["projet_id"], ["projets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["direction_id"], ["directions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_planifications_projet_projet_id"),
        "planifications_projet",
        ["projet_id"],
        unique=False,
    )

    op.create_table(
        "planification_projet_composantes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("planification_id", sa.Integer(), nullable=False),
        sa.Column("ordre", sa.Integer(), nullable=False),
        sa.Column("libelle", sa.String(255)),
        sa.ForeignKeyConstraint(
            ["planification_id"],
            ["planifications_projet.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "planification_projet_activites",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("composante_id", sa.Integer(), nullable=False),
        sa.Column("ordre", sa.Integer(), nullable=False),
        sa.Column("titre", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(
            ["composante_id"],
            ["planification_projet_composantes.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("planification_projet_activites")
    op.drop_table("planification_projet_composantes")
    op.drop_index(
        op.f("ix_planifications_projet_projet_id"), table_name="planifications_projet"
    )
    op.drop_table("planifications_projet")
