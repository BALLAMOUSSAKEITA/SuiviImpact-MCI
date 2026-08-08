"""Étend la plage d'années autorisée (2026–2040)."""

from alembic import op

revision = "017_widen_annee_range"
down_revision = "016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_trimestre_annee", "activite_trimestres", type_="check")
    op.create_check_constraint(
        "ck_trimestre_annee",
        "activite_trimestres",
        "annee >= 2026 AND annee <= 2040",
    )


def downgrade() -> None:
    op.drop_constraint("ck_trimestre_annee", "activite_trimestres", type_="check")
    op.create_check_constraint(
        "ck_trimestre_annee",
        "activite_trimestres",
        "annee BETWEEN 2025 AND 2027",
    )
