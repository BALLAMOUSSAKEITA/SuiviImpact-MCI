"""Add developpeur user role for notifications access.

Revision ID: 020
Revises: 019_notification_en_copie
"""

from typing import Sequence, Union

from alembic import op

revision: str = "020"
down_revision: Union[str, None] = "019_notification_en_copie"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            ALTER TYPE user_role ADD VALUE 'developpeur';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )


def downgrade() -> None:
    pass
