"""Workflow API endpoints."""

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.workflow import WorkflowActionCreate, WorkflowCreate, WorkflowRead
from app.services import workflow_service as service
from app.services.storage_service import storage_service

router = APIRouter()


@router.get("/workflows", response_model=list[WorkflowRead])
async def list_workflows(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[WorkflowRead]:
    return await service.list_workflows(db)


@router.get("/workflows/fichiers/{action_id}/download")
async def download_workflow_file(
    action_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    from app.models.workflow import WorkflowAction

    action = await db.get(WorkflowAction, action_id)
    if action is None or not action.file_path:
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    path = storage_service.resolve_path(action.file_path)
    return FileResponse(
        path=path,
        filename=action.file_name or "document",
        media_type="application/octet-stream",
    )


@router.get("/workflows/{workflow_id}", response_model=WorkflowRead)
async def get_workflow(
    workflow_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkflowRead:
    return await service.get_workflow(db, workflow_id)


@router.post("/workflows", response_model=WorkflowRead, status_code=201)
async def create_workflow(
    body: WorkflowCreate,
    user: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> WorkflowRead:
    return await service.create_workflow(db, body, user)


@router.post(
    "/workflows/{workflow_id}/steps/{step_id}/action",
    response_model=WorkflowRead,
)
async def perform_action(
    workflow_id: int,
    step_id: int,
    payload: str = Form(...),
    fichier: UploadFile | None = File(default=None),
    user: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> WorkflowRead:
    body = WorkflowActionCreate.model_validate_json(payload)
    return await service.perform_action(db, workflow_id, step_id, body, user, fichier)
