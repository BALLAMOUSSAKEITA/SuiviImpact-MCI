"""Accès workflow — rôle utilisateur ↔ étape du circuit."""

from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.workflow import WorkflowStepRole


_USER_TO_STEP: dict[UserRole, WorkflowStepRole] = {
    UserRole.DIRECTEUR: WorkflowStepRole.DIRECTEUR,
    UserRole.USER: WorkflowStepRole.BSD,
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
    """BSD (user) et super administrateur peuvent supprimer un workflow."""
    return user.role in (UserRole.USER, UserRole.ADMIN)


def assert_can_delete_workflow(user: User) -> None:
    if not can_delete_workflow(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul le BSD ou le super administrateur peut supprimer un workflow",
        )


def step_has_attached_file(step) -> bool:
    return any(a.file_path for a in step.actions)
