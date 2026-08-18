"""QR rotatif — paramétrage TTL et validation pass éphémère.

Revision ID: 030
Revises: 029
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "030"
down_revision: Union[str, None] = "029"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "presence_parametrage",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("qr_ttl_seconds", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        sa.text("INSERT INTO presence_parametrage (id, qr_ttl_seconds) VALUES (1, 20)")
    )


def downgrade() -> None:
    op.drop_table("presence_parametrage")
