"""Rôles applicatifs et règles d'accès."""

from fastapi import HTTPException, status

from app.models.user import AccessType, User, UserRole

READ_ONLY_ROLES = frozenset(
    {UserRole.DIRECTEUR, UserRole.SG, UserRole.MINISTRE, UserRole.DAF},
)


def is_read_only_role(role: UserRole) -> bool:
    return role in READ_ONLY_ROLES


def effective_can_write(user: User) -> bool:
    if user.role == UserRole.DEVELOPPEUR:
        return False
    if is_read_only_role(user.role):
        return False
    return user.type_acces == AccessType.ECRITURE


def normalize_role_for_create(role: UserRole, type_acces: AccessType) -> AccessType:
    if role == UserRole.DEVELOPPEUR:
        return AccessType.ECRITURE
    if is_read_only_role(role):
        return AccessType.LECTURE
    return type_acces


def assert_role_allowed_for_create(role: UserRole) -> None:
    """Le rôle « user » (ancien BSD) est remplacé par super administrateur."""
    if role == UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le rôle utilisateur BSD n'est plus disponible : créez un super administrateur (BSD).",
        )
