"""create workflow tables

Revision ID: 012
Revises: 011
Create Date: 2026-08-07

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

from app.db.migration_helpers import drop_enum, ensure_enum

revision: str = "012"
down_revision: Union[str, None] = "011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    ensure_enum("workflow_status_enum", "en_cours", "termine", "rejete")
    ensure_enum("workflow_step_role_enum", "directeur", "bsd", "sg", "ministre", "daf")
    ensure_enum("step_status_enum", "waiting", "active", "done", "rejected")
    ensure_enum("action_type_enum", "validate", "reject", "comment", "upload")

    workflow_status = postgresql.ENUM(
        "en_cours", "termine", "rejete", name="workflow_status_enum", create_type=False
    )
    step_role = postgresql.ENUM(
        "directeur", "bsd", "sg", "ministre", "daf", name="workflow_step_role_enum", create_type=False
    )
    step_status = postgresql.ENUM(
        "waiting", "active", "done", "rejected", name="step_status_enum", create_type=False
    )
    action_type = postgresql.ENUM(
        "validate", "reject", "comment", "upload", name="action_type_enum", create_type=False
    )

    op.create_table(
        "workflows",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("ref", sa.String(50), unique=True, nullable=False),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("status", workflow_status, server_default="en_cours", nullable=False),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )

    op.create_table(
        "workflow_steps",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("workflow_id", sa.Integer(), sa.ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", step_role, nullable=False),
        sa.Column("ordre", sa.Integer(), nullable=False),
        sa.Column("status", step_status, server_default="waiting", nullable=False),
        sa.Column("assigned_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("validated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_index(
        "ix_workflow_steps_workflow_id",
        "workflow_steps",
        ["workflow_id"],
        if_not_exists=True,
    )

    op.create_table(
        "workflow_actions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("step_id", sa.Integer(), sa.ForeignKey("workflow_steps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("action_type", action_type, nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("file_path", sa.String(500), nullable=True),
        sa.Column("file_name", sa.String(255), nullable=True),
        sa.Column("target_role", step_role, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        if_not_exists=True,
    )
    op.create_index(
        "ix_workflow_actions_step_id",
        "workflow_actions",
        ["step_id"],
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index("ix_workflow_actions_step_id", table_name="workflow_actions", if_exists=True)
    op.drop_table("workflow_actions", if_exists=True)
    op.drop_index("ix_workflow_steps_workflow_id", table_name="workflow_steps", if_exists=True)
    op.drop_table("workflow_steps", if_exists=True)
    op.drop_table("workflows", if_exists=True)
    drop_enum("action_type_enum")
    drop_enum("step_status_enum")
    drop_enum("workflow_step_role_enum")
    drop_enum("workflow_status_enum")
