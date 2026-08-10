"""Indicateurs: direction, nombre d'unités, référence numérique.

Revision ID: 022
Revises: 021
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "022"
down_revision: Union[str, None] = "021"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "indicateurs",
        sa.Column("nombre_unites", sa.Numeric(10, 2), nullable=True),
    )
    op.add_column(
        "indicateurs",
        sa.Column("direction_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_indicateurs_direction_id",
        "indicateurs",
        "directions",
        ["direction_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column(
        "indicateurs",
        sa.Column("reference_num", sa.Numeric(10, 2), nullable=True),
    )
    op.execute(
        """
        UPDATE indicateurs
        SET reference_num = CASE
            WHEN reference IS NOT NULL
                 AND trim(reference) ~ '^[0-9]+([.][0-9]+)?$'
            THEN trim(reference)::numeric
            ELSE NULL
        END
        """
    )
    op.drop_column("indicateurs", "reference")
    op.alter_column(
        "indicateurs",
        "reference_num",
        new_column_name="reference",
    )


def downgrade() -> None:
    op.add_column(
        "indicateurs",
        sa.Column("reference_str", sa.String(100), nullable=True),
    )
    op.execute(
        """
        UPDATE indicateurs
        SET reference_str = reference::text
        WHERE reference IS NOT NULL
        """
    )
    op.drop_column("indicateurs", "reference")
    op.alter_column(
        "indicateurs",
        "reference_str",
        new_column_name="reference",
    )

    op.drop_constraint("fk_indicateurs_direction_id", "indicateurs", type_="foreignkey")
    op.drop_column("indicateurs", "direction_id")
    op.drop_column("indicateurs", "nombre_unites")
