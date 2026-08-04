"""create directions table and seed data

Revision ID: 001
Revises:
Create Date: 2026-08-02

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DIRECTIONS = [
    ("IGNM", "IGNM"),
    ("APIP", "APIP"),
    ("DNPME.CL", "DNPME.CL"),
    ("DNPPP", "DNPPP"),
    ("DNPSP", "DNPSP"),
    ("DNI", "DNI"),
    ("3AE", "3AE"),
    ("ONCP", "ONCP"),
    ("SPI-T", "SPI-T"),
    ("CPTI", "CPTI"),
    ("FODIP", "FODIP"),
    ("FDEG", "FDEG"),
    ("AGESPI", "AGESPI"),
]


def upgrade() -> None:
    directions = op.create_table(
        "directions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("libelle", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        if_not_exists=True,
    )
    op.bulk_insert(
        directions,
        [{"code": code, "libelle": libelle} for code, libelle in DIRECTIONS],
    )


def downgrade() -> None:
    op.drop_table("directions")
