"""Ajoute en_copie aux notifications e-mail."""

from alembic import op
import sqlalchemy as sa

revision = "019_notification_en_copie"
down_revision = "018_notification_activite_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "notifications_email",
        sa.Column(
            "en_copie",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("notifications_email", "en_copie")
