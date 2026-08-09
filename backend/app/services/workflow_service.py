"""Workflow service — validation chain logic."""

from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.workflow import (
    ActionType,
    StepStatus,
    Workflow,
    WorkflowAction,
    WorkflowStatus,
    WorkflowStep,
    WorkflowStepRole,
    WORKFLOW_STEP_ORDER,
)
from app.schemas.workflow import (
    WorkflowActionCreate,
    WorkflowActionRead,
    WorkflowCreate,
    WorkflowRead,
    WorkflowStepRead,
)
from app.core.workflow_access import (
    assert_can_act_on_step,
    assert_can_create_workflow,
    assert_can_delete_workflow,
    step_has_attached_file,
)
from app.services.storage_service import storage_service


async def _attach_initial_file(
    db: AsyncSession, step: WorkflowStep, user: User, file: UploadFile
) -> None:
    chemin, nom, _ = await storage_service.save_upload(file, "workflow")
    db.add(
        WorkflowAction(
            step_id=step.id,
            user_id=user.id,
            action_type=ActionType.UPLOAD,
            comment=None,
            file_path=chemin,
            file_name=nom,
            target_role=None,
        )
    )


async def _next_ref(db: AsyncSession) -> str:
    result = await db.execute(select(func.count(Workflow.id)))
    count = result.scalar() or 0
    return f"WF-{count + 1:03d}"


def _workflow_to_read(wf: Workflow) -> WorkflowRead:
    steps = []
    for step in wf.steps:
        actions = []
        for action in step.actions:
            actions.append(
                WorkflowActionRead(
                    id=action.id,
                    action_type=action.action_type,
                    comment=action.comment,
                    file_name=action.file_name,
                    file_path=action.file_path,
                    target_role=action.target_role,
                    user_id=action.user_id,
                    user_prenom=action.user.prenom if action.user else "—",
                    created_at=action.created_at,
                )
            )
        steps.append(
            WorkflowStepRead(
                id=step.id,
                role=step.role,
                ordre=step.ordre,
                status=step.status,
                assigned_user_id=step.assigned_user_id,
                assigned_user_prenom=None,
                validated_at=step.validated_at,
                actions=actions,
            )
        )
    return WorkflowRead(
        id=wf.id,
        title=wf.title,
        ref=wf.ref,
        type=wf.type,
        status=wf.status,
        created_by=wf.created_by,
        creator_prenom=wf.creator.prenom if wf.creator else "—",
        steps=steps,
        created_at=wf.created_at,
        updated_at=wf.updated_at,
    )


async def _load_workflow(db: AsyncSession, workflow_id: int) -> Workflow:
    result = await db.execute(
        select(Workflow)
        .where(Workflow.id == workflow_id)
        .options(
            selectinload(Workflow.steps).selectinload(WorkflowStep.actions).selectinload(WorkflowAction.user),
            selectinload(Workflow.creator),
        )
    )
    wf = result.scalar_one_or_none()
    if wf is None:
        raise HTTPException(status_code=404, detail="Workflow introuvable")
    return wf


async def list_workflows(db: AsyncSession) -> list[WorkflowRead]:
    result = await db.execute(
        select(Workflow)
        .options(
            selectinload(Workflow.steps).selectinload(WorkflowStep.actions).selectinload(WorkflowAction.user),
            selectinload(Workflow.creator),
        )
        .order_by(Workflow.created_at.desc())
    )
    workflows = result.scalars().unique().all()
    return [_workflow_to_read(wf) for wf in workflows]


async def create_workflow(
    db: AsyncSession,
    body: WorkflowCreate,
    user: User,
    initial_file: UploadFile | None = None,
) -> WorkflowRead:
    assert_can_create_workflow(user)
    ref = await _next_ref(db)
    wf = Workflow(
        title=body.title,
        ref=ref,
        type=body.type,
        status=WorkflowStatus.EN_COURS,
        created_by=user.id,
    )
    db.add(wf)
    await db.flush()

    for i, role in enumerate(WORKFLOW_STEP_ORDER):
        step = WorkflowStep(
            workflow_id=wf.id,
            role=role,
            ordre=i + 1,
            status=StepStatus.ACTIVE if i == 0 else StepStatus.WAITING,
        )
        db.add(step)

    await db.flush()

    step_result = await db.execute(
        select(WorkflowStep).where(
            WorkflowStep.workflow_id == wf.id,
            WorkflowStep.role == WorkflowStepRole.DIRECTEUR,
        )
    )
    directeur_step = step_result.scalar_one()
    if initial_file is not None and initial_file.filename:
        await _attach_initial_file(db, directeur_step, user, initial_file)

    await db.commit()
    return _workflow_to_read(await _load_workflow(db, wf.id))


async def perform_action(
    db: AsyncSession,
    workflow_id: int,
    step_id: int,
    body: WorkflowActionCreate,
    user: User,
    file: UploadFile | None = None,
) -> WorkflowRead:
    wf = await _load_workflow(db, workflow_id)

    step = next((s for s in wf.steps if s.id == step_id), None)
    if step is None:
        raise HTTPException(status_code=404, detail="Étape introuvable")

    if step.status != StepStatus.ACTIVE:
        raise HTTPException(
            status_code=400,
            detail="Cette étape n'est pas active actuellement",
        )

    assert_can_act_on_step(user, WorkflowStepRole(step.role))

    if body.action_type == ActionType.VALIDATE:
        incoming_file = file is not None and bool(file.filename)
        if not incoming_file and not step_has_attached_file(step):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un fichier est requis pour valider et transmettre au prochain niveau",
            )

    file_path = None
    file_name = None
    if file is not None and file.filename:
        chemin, nom, _ = await storage_service.save_upload(file, "workflow")
        file_path = chemin
        file_name = nom

    action = WorkflowAction(
        step_id=step.id,
        user_id=user.id,
        action_type=body.action_type,
        comment=body.comment,
        file_path=file_path,
        file_name=file_name,
        target_role=body.target_role,
    )
    db.add(action)

    if body.action_type == ActionType.VALIDATE:
        step.status = StepStatus.DONE
        step.validated_at = datetime.now(timezone.utc)

        current_idx = WORKFLOW_STEP_ORDER.index(WorkflowStepRole(step.role))
        if current_idx < len(WORKFLOW_STEP_ORDER) - 1:
            next_step = next(
                (s for s in wf.steps if s.ordre == step.ordre + 1), None
            )
            if next_step:
                next_step.status = StepStatus.ACTIVE
        else:
            wf.status = WorkflowStatus.TERMINE

    elif body.action_type == ActionType.REJECT:
        if body.target_role is None:
            raise HTTPException(
                status_code=400,
                detail="target_role est requis pour un rejet",
            )

        step.status = StepStatus.REJECTED
        wf.status = WorkflowStatus.REJETE

        target_idx = WORKFLOW_STEP_ORDER.index(body.target_role)
        for s in wf.steps:
            role_idx = WORKFLOW_STEP_ORDER.index(WorkflowStepRole(s.role))
            if role_idx == target_idx:
                s.status = StepStatus.ACTIVE
            elif role_idx > target_idx:
                s.status = StepStatus.WAITING
                s.validated_at = None

        wf.status = WorkflowStatus.EN_COURS

    await db.commit()
    return _workflow_to_read(await _load_workflow(db, wf.id))


async def get_workflow(db: AsyncSession, workflow_id: int) -> WorkflowRead:
    wf = await _load_workflow(db, workflow_id)
    return _workflow_to_read(wf)


def _delete_action_file(file_path: str | None) -> None:
    if not file_path:
        return
    try:
        storage_service.delete_file(file_path)
    except HTTPException:
        pass


async def delete_workflow(db: AsyncSession, workflow_id: int, user: User) -> None:
    assert_can_delete_workflow(user)
    wf = await _load_workflow(db, workflow_id)

    for step in wf.steps:
        for action in step.actions:
            _delete_action_file(action.file_path)

    await db.delete(wf)
    await db.commit()
