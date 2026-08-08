"""Ajoute activite_id aux notifications e-mail."""

from alembic import op
import sqlalchemy as sa

revision = "018_notification_activite_id"
down_revision = "017_widen_annee_range"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "notifications_email",
        sa.Column("activite_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_notifications_email_activite_id",
        "notifications_email",
        "activites",
        ["activite_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_notifications_email_activite_id",
        "notifications_email",
        type_="foreignkey",
    )
    op.drop_column("notifications_email", "activite_id")
