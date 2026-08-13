"""Paramétrage secrétaire général (2 e-mails).

Revision ID: 023
Revises: 022
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "023"
down_revision: Union[str, None] = "022"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sg_parametrage",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("prenom", sa.String(100), nullable=False, server_default=""),
        sa.Column("nom", sa.String(100), nullable=False, server_default=""),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("email_2", sa.String(255), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        """
        INSERT INTO sg_parametrage (id, prenom, nom, email, email_2)
        VALUES (1, '', '', NULL, NULL)
        """
    )


def downgrade() -> None:
    op.drop_table("sg_parametrage")
