"""user nom, avatar and extended roles

Revision ID: 015
Revises: 014
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "015"
down_revision: Union[str, None] = "014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for value in ("directeur", "sg", "ministre"):
        op.execute(
            f"""
            DO $$
            BEGIN
                ALTER TYPE user_role ADD VALUE '{value}';
            EXCEPTION
                WHEN duplicate_object THEN NULL;
            END $$;
            """
        )

    op.add_column(
        "users",
        sa.Column("nom", sa.String(length=100), nullable=False, server_default=""),
    )
    op.add_column(
        "users",
        sa.Column("avatar_path", sa.String(length=512), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "avatar_path")
    op.drop_column("users", "nom")
