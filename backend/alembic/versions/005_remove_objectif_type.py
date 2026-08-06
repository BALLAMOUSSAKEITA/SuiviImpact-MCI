"""remove objectif type (OCT/OMT/OLT)

Revision ID: 005
Revises: 004
Create Date: 2026-08-05

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.db.migration_helpers import drop_enum

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    conn.execute(
        sa.text(
            """
            UPDATE objectifs o
            SET code = o.type::text || '-' || o.code
            WHERE EXISTS (
                SELECT 1 FROM objectifs o2
                WHERE o2.code = o.code AND o2.id <> o.id
            )
            """
        )
    )

    op.drop_constraint("objectifs_type_code_key", "objectifs", type_="unique")
    op.drop_column("objectifs", "type")
    op.create_unique_constraint("objectifs_code_key", "objectifs", ["code"])
    drop_enum("objectif_type")


def downgrade() -> None:
    raise NotImplementedError("Downgrade non supporté pour 005_remove_objectif_type")
