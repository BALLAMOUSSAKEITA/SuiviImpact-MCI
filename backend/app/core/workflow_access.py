"""Accès workflow — rôle utilisateur ↔ étape du circuit."""

from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.workflow import WorkflowStepRole


_USER_TO_STEP: dict[UserRole, WorkflowStepRole] = {
    UserRole.ADMIN: WorkflowStepRole.BSD,
    UserRole.USER: WorkflowStepRole.BSD,
    UserRole.DIRECTEUR: WorkflowStepRole.DIRECTEUR,
    UserRole.SG: WorkflowStepRole.SG,
    UserRole.MINISTRE: WorkflowStepRole.MINISTRE,
    UserRole.DAF: WorkflowStepRole.DAF,
}


def user_workflow_step_role(user: User) -> WorkflowStepRole | None:
    return _USER_TO_STEP.get(user.role)


def can_create_workflow(user: User) -> bool:
    return user.role == UserRole.DIRECTEUR


def assert_can_create_workflow(user: User) -> None:
    if not can_create_workflow(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un directeur peut déclencher un workflow",
        )


def assert_can_act_on_step(user: User, step_role: WorkflowStepRole) -> None:
    actor = user_workflow_step_role(user)
    if actor is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte ne participe pas à ce circuit de validation",
        )
    if actor != step_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez agir que sur votre propre étape du workflow",
        )


def can_delete_workflow(user: User) -> bool:
    """Super administrateur (BSD) — rôle user conservé pour les comptes historiques."""
    return user.role in (UserRole.ADMIN, UserRole.USER)


def assert_can_delete_workflow(user: User) -> None:
    if not can_delete_workflow(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul le super administrateur (BSD) peut supprimer un workflow",
        )


def can_view_workflow_files(user: User) -> bool:
    """Tout participant au circuit (ou BSD / super admin) peut consulter les pièces jointes."""
    return user.role in (
        UserRole.ADMIN,
        UserRole.USER,
        UserRole.DIRECTEUR,
        UserRole.SG,
        UserRole.MINISTRE,
        UserRole.DAF,
    )


def assert_can_view_workflow_files(user: User) -> None:
    if not can_view_workflow_files(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé aux fichiers du workflow",
        )


def step_has_attached_file(step) -> bool:
    return any(a.file_path for a in step.actions)
