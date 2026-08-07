"""Workflow models for document validation chain."""

import enum
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class WorkflowStepRole(str, enum.Enum):
    DIRECTEUR = "directeur"
    BSD = "bsd"
    SG = "sg"
    MINISTRE = "ministre"
    DAF = "daf"


WORKFLOW_STEP_ORDER = [
    WorkflowStepRole.DIRECTEUR,
    WorkflowStepRole.BSD,
    WorkflowStepRole.SG,
    WorkflowStepRole.MINISTRE,
    WorkflowStepRole.DAF,
]


class WorkflowStatus(str, enum.Enum):
    EN_COURS = "en_cours"
    TERMINE = "termine"
    REJETE = "rejete"


class StepStatus(str, enum.Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    DONE = "done"
    REJECTED = "rejected"


class ActionType(str, enum.Enum):
    VALIDATE = "validate"
    REJECT = "reject"
    COMMENT = "comment"
    UPLOAD = "upload"


class Workflow(Base):
    __tablename__ = "workflows"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    ref: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[WorkflowStatus] = mapped_column(
        Enum(WorkflowStatus, name="workflow_status_enum"),
        default=WorkflowStatus.EN_COURS,
        nullable=False,
    )
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    steps: Mapped[list["WorkflowStep"]] = relationship(
        back_populates="workflow",
        cascade="all, delete-orphan",
        order_by="WorkflowStep.ordre",
    )
    creator: Mapped["User"] = relationship(foreign_keys=[created_by])


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    workflow_id: Mapped[int] = mapped_column(
        ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[WorkflowStepRole] = mapped_column(
        Enum(WorkflowStepRole, name="workflow_step_role_enum"), nullable=False
    )
    ordre: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[StepStatus] = mapped_column(
        Enum(StepStatus, name="step_status_enum"),
        default=StepStatus.WAITING,
        nullable=False,
    )
    assigned_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    validated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    workflow: Mapped["Workflow"] = relationship(back_populates="steps")
    actions: Mapped[list["WorkflowAction"]] = relationship(
        back_populates="step",
        cascade="all, delete-orphan",
        order_by="WorkflowAction.created_at.desc()",
    )


class WorkflowAction(Base):
    __tablename__ = "workflow_actions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    step_id: Mapped[int] = mapped_column(
        ForeignKey("workflow_steps.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    action_type: Mapped[ActionType] = mapped_column(
        Enum(ActionType, name="action_type_enum"), nullable=False
    )
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_role: Mapped[WorkflowStepRole | None] = mapped_column(
        Enum(WorkflowStepRole, name="workflow_step_role_enum", create_type=False),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    step: Mapped["WorkflowStep"] = relationship(back_populates="actions")
    user: Mapped["User"] = relationship(foreign_keys=[user_id])


from app.models.user import User  # noqa: E402
