"""Rôles applicatifs et règles d'accès."""

from app.models.user import AccessType, User, UserRole

READ_ONLY_ROLES = frozenset(
    {UserRole.DIRECTEUR, UserRole.SG, UserRole.MINISTRE, UserRole.DAF},
)


def is_read_only_role(role: UserRole) -> bool:
    return role in READ_ONLY_ROLES


def effective_can_write(user: User) -> bool:
    if is_read_only_role(user.role):
        return False
    return user.type_acces == AccessType.ECRITURE


def normalize_role_for_create(role: UserRole, type_acces: AccessType) -> AccessType:
    if is_read_only_role(role):
        return AccessType.LECTURE
    return type_acces
