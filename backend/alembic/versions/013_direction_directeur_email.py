"""direction directeur and email

Revision ID: 013
Revises: 012
Create Date: 2026-08-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "013"
down_revision: Union[str, None] = "012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "directions",
        sa.Column("directeur_nom", sa.String(150), nullable=True),
    )
    op.add_column(
        "directions",
        sa.Column("email_directeur", sa.String(255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("directions", "email_directeur")
    op.drop_column("directions", "directeur_nom")
