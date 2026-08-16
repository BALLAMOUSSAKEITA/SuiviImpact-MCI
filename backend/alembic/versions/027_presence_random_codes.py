"""Codes de présence aléatoires pour le personnel cabinet.

Revision ID: 027
Revises: 026
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "027"
down_revision: Union[str, None] = "026"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from app.services.presence_codes import generate_unique_codes

    conn = op.get_bind()
    rows = conn.execute(
        sa.text("SELECT id FROM personnel_cabinet ORDER BY num_ordre")
    ).fetchall()
    if not rows:
        return

    codes = generate_unique_codes(len(rows), seed=20260816)
    for (row_id,), code in zip(rows, codes, strict=True):
        conn.execute(
            sa.text("UPDATE personnel_cabinet SET code_presence = :code WHERE id = :id"),
            {"code": code, "id": row_id},
        )


def downgrade() -> None:
    pass
