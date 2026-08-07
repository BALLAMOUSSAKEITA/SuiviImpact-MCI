"""Workflow schemas."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class WorkflowStepRole(str, Enum):
    DIRECTEUR = "directeur"
    BSD = "bsd"
    SG = "sg"
    MINISTRE = "ministre"
    DAF = "daf"


class WorkflowStatus(str, Enum):
    EN_COURS = "en_cours"
    TERMINE = "termine"
    REJETE = "rejete"


class StepStatus(str, Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    DONE = "done"
    REJECTED = "rejected"


class ActionType(str, Enum):
    VALIDATE = "validate"
    REJECT = "reject"
    COMMENT = "comment"
    UPLOAD = "upload"


# --- Create ---

class WorkflowCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    type: str = Field(min_length=1, max_length=100)


# --- Action ---

class WorkflowActionCreate(BaseModel):
    action_type: ActionType
    comment: str | None = None
    target_role: WorkflowStepRole | None = None


# --- Read ---

class WorkflowActionRead(BaseModel):
    id: int
    action_type: ActionType
    comment: str | None
    file_name: str | None
    file_path: str | None
    target_role: WorkflowStepRole | None
    user_id: int
    user_prenom: str
    created_at: datetime


class WorkflowStepRead(BaseModel):
    id: int
    role: WorkflowStepRole
    ordre: int
    status: StepStatus
    assigned_user_id: int | None
    assigned_user_prenom: str | None
    validated_at: datetime | None
    actions: list[WorkflowActionRead]


class WorkflowRead(BaseModel):
    id: int
    title: str
    ref: str
    type: str
    status: WorkflowStatus
    created_by: int
    creator_prenom: str
    steps: list[WorkflowStepRead]
    created_at: datetime
    updated_at: datetime
