"""Tables finances (snapshot Excel + lignes budgétaires).

Revision ID: 024
Revises: 023
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "024"
down_revision: Union[str, None] = "023"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "finance_snapshot",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column(
            "imported_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("imported_by_user_id", sa.Integer(), nullable=True),
        sa.Column("row_count", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(
            ["imported_by_user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "finance_lignes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("ordre", sa.Integer(), nullable=False),
        sa.Column("titre_budget", sa.Text(), nullable=False),
        sa.Column("montant_prevu", sa.Numeric(18, 2), nullable=True),
        sa.Column("montant_engage", sa.Numeric(18, 2), nullable=True),
        sa.Column("montant_paye", sa.Numeric(18, 2), nullable=True),
        sa.Column("taux_engagement", sa.Numeric(12, 8), nullable=True),
        sa.Column("taux_caisse", sa.Numeric(12, 8), nullable=True),
        sa.Column("source_information", sa.Text(), nullable=True),
        sa.Column("is_total", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("finance_lignes")
    op.drop_table("finance_snapshot")
