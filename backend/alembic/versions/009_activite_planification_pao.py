"""activite planification PAO fields

Revision ID: 009
Revises: 008
Create Date: 2026-08-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "009"
down_revision: Union[str, None] = "008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("activites", sa.Column("date_debut", sa.Date(), nullable=True))
    op.add_column("activites", sa.Column("date_fin", sa.Date(), nullable=True))
    op.add_column("activites", sa.Column("email_responsable", sa.String(255), nullable=True))
    op.add_column("activites", sa.Column("email_ministre", sa.String(255), nullable=True))
    op.add_column("activites", sa.Column("tdr_chemin", sa.String(500), nullable=True))
    op.add_column("activites", sa.Column("tdr_nom_original", sa.String(255), nullable=True))
    op.add_column("taches", sa.Column("tache_plan_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_taches_tache_plan_id",
        "taches",
        "taches_plan",
        ["tache_plan_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_taches_tache_plan_id", "taches", type_="foreignkey")
    op.drop_column("taches", "tache_plan_id")
    op.drop_column("activites", "tdr_nom_original")
    op.drop_column("activites", "tdr_chemin")
    op.drop_column("activites", "email_ministre")
    op.drop_column("activites", "email_responsable")
    op.drop_column("activites", "date_fin")
    op.drop_column("activites", "date_debut")
