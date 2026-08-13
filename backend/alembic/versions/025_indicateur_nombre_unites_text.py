"""Indicateurs: nombre d'unités en texte.

Revision ID: 025
Revises: 024
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "025"
down_revision: Union[str, None] = "024"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "indicateurs",
        "nombre_unites",
        existing_type=sa.Numeric(10, 2),
        type_=sa.String(length=100),
        existing_nullable=True,
        postgresql_using="nombre_unites::text",
    )


def downgrade() -> None:
    op.alter_column(
        "indicateurs",
        "nombre_unites",
        existing_type=sa.String(length=100),
        type_=sa.Numeric(10, 2),
        existing_nullable=True,
        postgresql_using="""
            CASE
                WHEN nombre_unites IS NOT NULL
                     AND trim(nombre_unites) ~ '^[0-9]+([.][0-9]+)?$'
                THEN trim(nombre_unites)::numeric
                ELSE NULL
            END
        """,
    )
