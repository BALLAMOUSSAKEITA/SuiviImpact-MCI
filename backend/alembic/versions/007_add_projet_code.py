"""add unique code to projets

Revision ID: 007
Revises: 006
Create Date: 2026-08-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("projets", sa.Column("code", sa.String(length=32), nullable=True))
    op.execute(
        sa.text(
            "UPDATE projets SET code = 'PRJ-' || LPAD(id::text, 6, '0') WHERE code IS NULL"
        )
    )
    op.alter_column("projets", "code", nullable=False)
    op.create_index("ix_projets_code", "projets", ["code"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_projets_code", table_name="projets")
    op.drop_column("projets", "code")
