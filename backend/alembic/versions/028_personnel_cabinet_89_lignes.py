"""Compléter le personnel cabinet à 89 lignes (numéros 1–89).

Revision ID: 028
Revises: 027
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.data.personnel_cabinet_seed import (
    PERSONNEL_CABINET_SEED,
    personnel_actif_for_seed,
)
from app.services.presence_codes import generate_presence_code

revision: str = "028"
down_revision: Union[str, None] = "027"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    existing_nums = {
        row[0]
        for row in conn.execute(sa.text("SELECT num_ordre FROM personnel_cabinet")).fetchall()
    }
    existing_codes = {
        row[0]
        for row in conn.execute(sa.text("SELECT code_presence FROM personnel_cabinet")).fetchall()
    }

    for row in PERSONNEL_CABINET_SEED:
        if row["num_ordre"] in existing_nums:
            continue
        code = generate_presence_code(existing_codes)
        existing_codes.add(code)
        conn.execute(
            sa.text(
                """
                INSERT INTO personnel_cabinet
                    (num_ordre, nom_complet, fonction, contact, email, categorie, code_presence, actif)
                VALUES
                    (:num_ordre, :nom_complet, :fonction, :contact, :email, :categorie, :code_presence, :actif)
                """
            ),
            {
                "num_ordre": row["num_ordre"],
                "nom_complet": row["nom_complet"],
                "fonction": row["fonction"],
                "contact": row["contact"],
                "email": row["email"],
                "categorie": row["categorie"],
                "code_presence": code,
                "actif": personnel_actif_for_seed(row),
            },
        )

    conn.execute(
        sa.text(
            """
            UPDATE personnel_cabinet
            SET actif = false
            WHERE trim(coalesce(nom_complet, '')) = ''
            """
        )
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("DELETE FROM personnel_cabinet WHERE trim(coalesce(nom_complet, '')) = ''")
    )
