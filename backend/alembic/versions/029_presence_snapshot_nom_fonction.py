"""Snapshot nom et fonction sur les enregistrements de présence.

Revision ID: 029
Revises: 028
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "029"
down_revision: Union[str, None] = "028"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "presences_enregistrements",
        sa.Column("nom_complet", sa.String(length=200), nullable=False, server_default=""),
    )
    op.add_column(
        "presences_enregistrements",
        sa.Column("fonction", sa.String(length=500), nullable=False, server_default=""),
    )

    op.execute(
        sa.text(
            """
            UPDATE presences_enregistrements pe
            SET
                nom_complet = pc.nom_complet,
                fonction = pc.fonction
            FROM personnel_cabinet pc
            WHERE pe.personnel_id = pc.id
            """
        )
    )

    op.alter_column("presences_enregistrements", "nom_complet", server_default=None)
    op.alter_column("presences_enregistrements", "fonction", server_default=None)


def downgrade() -> None:
    op.drop_column("presences_enregistrements", "fonction")
    op.drop_column("presences_enregistrements", "nom_complet")
