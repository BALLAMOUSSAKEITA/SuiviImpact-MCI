"""Add projet type (ordinaire / mega Simandou).

Revision ID: 021
Revises: 020
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "021"
down_revision: Union[str, None] = "020"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            CREATE TYPE projet_type_enum AS ENUM ('ordinaire', 'mega_simandou');
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )
    op.add_column(
        "projets",
        sa.Column(
            "type_projet",
            sa.Enum("ordinaire", "mega_simandou", name="projet_type_enum", create_type=False),
            server_default="ordinaire",
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("projets", "type_projet")
    op.execute("DROP TYPE IF EXISTS projet_type_enum")
