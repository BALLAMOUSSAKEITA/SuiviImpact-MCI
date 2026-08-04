"""create objectifs and activites tables

Revision ID: 003
Revises: 002
Create Date: 2026-08-04

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

objectif_type = sa.Enum("oct", "omt", "olt", name="objectif_type", create_type=False)


def upgrade() -> None:
    objectif_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "objectifs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("type", objectif_type, nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
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
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("type", "code"),
    )

    op.create_table(
        "activites",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("objectif_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("budget", sa.Numeric(15, 2), server_default="0", nullable=False),
        sa.Column("execution", sa.Numeric(5, 2), server_default="0", nullable=False),
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
        sa.CheckConstraint("execution >= 0 AND execution <= 100", name="ck_execution_range"),
        sa.ForeignKeyConstraint(["objectif_id"], ["objectifs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "activite_trimestres",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("activite_id", sa.Integer(), nullable=False),
        sa.Column("annee", sa.Integer(), nullable=False),
        sa.Column("trimestre", sa.Integer(), nullable=False),
        sa.Column("planifie", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.CheckConstraint("annee BETWEEN 2025 AND 2027", name="ck_trimestre_annee"),
        sa.CheckConstraint("trimestre BETWEEN 1 AND 4", name="ck_trimestre_num"),
        sa.ForeignKeyConstraint(["activite_id"], ["activites.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("activite_id", "annee", "trimestre"),
    )

    op.create_table(
        "activite_directions",
        sa.Column("activite_id", sa.Integer(), nullable=False),
        sa.Column("direction_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["activite_id"], ["activites.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["direction_id"], ["directions.id"]),
        sa.PrimaryKeyConstraint("activite_id", "direction_id"),
    )


def downgrade() -> None:
    op.drop_table("activite_directions")
    op.drop_table("activite_trimestres")
    op.drop_table("activites")
    op.drop_table("objectifs")
    objectif_type.drop(op.get_bind(), checkfirst=True)
