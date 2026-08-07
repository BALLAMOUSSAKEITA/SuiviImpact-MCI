"""add terminee and rapport to planification_projet_activites

Revision ID: 011
Revises: 010
Create Date: 2026-08-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "011"
down_revision: Union[str, None] = "010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "planification_projet_activites",
        sa.Column("terminee", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "planification_projet_activites",
        sa.Column("rapport_chemin", sa.String(500), nullable=True),
    )
    op.add_column(
        "planification_projet_activites",
        sa.Column("rapport_nom_original", sa.String(255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("planification_projet_activites", "rapport_nom_original")
    op.drop_column("planification_projet_activites", "rapport_chemin")
    op.drop_column("planification_projet_activites", "terminee")
