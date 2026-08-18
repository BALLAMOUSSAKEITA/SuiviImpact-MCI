"""Onglets assignables aux comptes Membre BSD."""

from fastapi import HTTPException, status

from app.models.user import UserRole

BSD_MEMBER_TABS = (
    "vue-ensemble",
    "parametrage",
    "planification",
    "suivi",
    "finances",
    "statistiques",
    "workflow",
    "export",
    "archive",
    "presence",
)

BSD_MEMBER_TAB_KEYS = frozenset(BSD_MEMBER_TABS)


def normalize_allowed_tabs(role: UserRole, tabs: list[str] | None) -> list[str]:
    """Vide pour les autres rôles ; obligatoire et filtré pour Membre BSD."""
    raw = tabs or []
    if role != UserRole.MEMBRE_BSD:
        return []

    unknown = sorted({tab for tab in raw if tab not in BSD_MEMBER_TAB_KEYS})
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Onglets inconnus : {', '.join(unknown)}",
        )

    ordered = [tab for tab in BSD_MEMBER_TABS if tab in set(raw)]
    if not ordered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sélectionnez au moins un onglet pour un compte Membre BSD.",
        )
    return ordered
