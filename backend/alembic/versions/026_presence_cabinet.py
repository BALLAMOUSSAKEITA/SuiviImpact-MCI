"""Présence Conseil de Cabinet — personnel, séances, pointage QR.

Revision ID: 026
Revises: 025
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.data.personnel_cabinet_seed import PERSONNEL_CABINET_SEED, code_for_num_ordre

revision: str = "026"
down_revision: Union[str, None] = "025"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    seance_statut = sa.Enum("ouverte", "fermee", name="seance_statut")
    seance_statut.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "personnel_cabinet",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("num_ordre", sa.Integer(), nullable=False),
        sa.Column("nom_complet", sa.String(length=200), nullable=False),
        sa.Column("fonction", sa.String(length=500), nullable=False),
        sa.Column("contact", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("categorie", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("code_presence", sa.String(length=4), nullable=False),
        sa.Column("actif", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("num_ordre"),
        sa.UniqueConstraint("code_presence"),
    )

    op.create_table(
        "seances_presence",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("titre", sa.String(length=255), nullable=False),
        sa.Column("date_seance", sa.Date(), nullable=False),
        sa.Column("token", sa.String(length=64), nullable=False),
        sa.Column(
            "statut",
            seance_statut,
            nullable=False,
            server_default="ouverte",
        ),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )
    op.create_index("ix_seances_presence_token", "seances_presence", ["token"])

    op.create_table(
        "presences_enregistrements",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("seance_id", sa.Integer(), nullable=False),
        sa.Column("personnel_id", sa.Integer(), nullable=False),
        sa.Column("pointe_a", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["personnel_id"], ["personnel_cabinet.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["seance_id"], ["seances_presence.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("seance_id", "personnel_id", name="uq_presence_seance_personnel"),
    )

    personnel_table = sa.table(
        "personnel_cabinet",
        sa.column("num_ordre", sa.Integer),
        sa.column("nom_complet", sa.String),
        sa.column("fonction", sa.String),
        sa.column("contact", sa.String),
        sa.column("email", sa.String),
        sa.column("categorie", sa.String),
        sa.column("code_presence", sa.String),
        sa.column("actif", sa.Boolean),
    )
    op.bulk_insert(
        personnel_table,
        [
            {
                "num_ordre": row["num_ordre"],
                "nom_complet": row["nom_complet"],
                "fonction": row["fonction"],
                "contact": row["contact"],
                "email": row["email"],
                "categorie": row["categorie"],
                "code_presence": code_for_num_ordre(row["num_ordre"]),
                "actif": True,
            }
            for row in PERSONNEL_CABINET_SEED
        ],
    )


def downgrade() -> None:
    op.drop_table("presences_enregistrements")
    op.drop_index("ix_seances_presence_token", table_name="seances_presence")
    op.drop_table("seances_presence")
    op.drop_table("personnel_cabinet")
    sa.Enum(name="seance_statut").drop(op.get_bind(), checkfirst=True)
