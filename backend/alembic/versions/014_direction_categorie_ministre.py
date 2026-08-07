"""direction categorie and ministre parametrage

Revision ID: 014
Revises: 013
Create Date: 2026-08-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "014"
down_revision: Union[str, None] = "013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "directions",
        sa.Column(
            "categorie",
            sa.String(30),
            server_default="ministere",
            nullable=False,
        ),
    )
    op.create_check_constraint(
        "ck_directions_categorie",
        "directions",
        "categorie IN ('ministere', 'pouvoir_supreme', 'pouvoir_indirect')",
    )

    op.create_table(
        "ministre_parametrage",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("prenom", sa.String(100), server_default="", nullable=False),
        sa.Column("nom", sa.String(100), server_default="", nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.execute(
        """
        INSERT INTO ministre_parametrage (id, prenom, nom, email)
        VALUES (1, '', '', NULL)
        ON CONFLICT (id) DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_table("ministre_parametrage", if_exists=True)
    op.drop_constraint("ck_directions_categorie", "directions", type_="check")
    op.drop_column("directions", "categorie")
