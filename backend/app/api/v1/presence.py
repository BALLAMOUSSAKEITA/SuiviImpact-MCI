from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_write_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.presence import (
    CheckInRequest,
    CheckInResponse,
    PersonnelCabinetCreate,
    PersonnelCabinetRead,
    PersonnelCabinetUpdate,
    PublicSeanceInfo,
    SeancePresenceCreate,
    SeancePresenceDetail,
    SeancePresenceRead,
)
from app.services import presence_service as service

router = APIRouter()


# --- Personnel (admin) ---


@router.get("/presence/personnel", response_model=list[PersonnelCabinetRead])
async def list_personnel(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PersonnelCabinetRead]:
    items = await service.list_personnel(db)
    return [PersonnelCabinetRead.model_validate(i) for i in items]


@router.post(
    "/presence/personnel",
    response_model=PersonnelCabinetRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_personnel(
    body: PersonnelCabinetCreate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> PersonnelCabinetRead:
    item = await service.create_personnel(db, body)
    return PersonnelCabinetRead.model_validate(item)


@router.put("/presence/personnel/{personnel_id}", response_model=PersonnelCabinetRead)
async def update_personnel(
    personnel_id: int,
    body: PersonnelCabinetUpdate,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> PersonnelCabinetRead:
    item = await service.get_personnel(db, personnel_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Personnel introuvable")
    updated = await service.update_personnel(db, item, body)
    return PersonnelCabinetRead.model_validate(updated)


@router.post("/presence/personnel/regenerer-codes")
async def regenerate_personnel_codes(
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    count = await service.regenerate_all_codes(db)
    return {"updated": count}


@router.post("/presence/personnel/restaurer-seed")
async def restore_personnel_seed(
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    """Restaure la liste officielle (89 lignes) si vide ou incomplète — n'écrase pas les données existantes."""
    return await service.restore_personnel_from_seed(db)


@router.delete("/presence/personnel/{personnel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_personnel(
    personnel_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    item = await service.get_personnel(db, personnel_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Personnel introuvable")
    await service.delete_personnel(db, item)


# --- Séances (admin) ---


@router.get("/presence/seances", response_model=list[SeancePresenceRead])
async def list_seances(
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SeancePresenceRead]:
    return await service.list_seances(db)


@router.get("/presence/seances/{seance_id}", response_model=SeancePresenceDetail)
async def get_seance_detail(
    seance_id: int,
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SeancePresenceDetail:
    detail = await service.get_seance_detail(db, seance_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    return detail


@router.post(
    "/presence/seances",
    response_model=SeancePresenceRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_seance(
    body: SeancePresenceCreate,
    user: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> SeancePresenceRead:
    return await service.create_seance(db, body, created_by=user.id)


@router.patch("/presence/seances/{seance_id}/cloturer", response_model=SeancePresenceRead)
async def close_seance(
    seance_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> SeancePresenceRead:
    seance = await service.get_seance(db, seance_id)
    if seance is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    return await service.close_seance(db, seance)


@router.delete("/presence/seances/{seance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seance(
    seance_id: int,
    _: User = Depends(require_write_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    seance = await service.get_seance(db, seance_id)
    if seance is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    await service.delete_seance(db, seance)


@router.get("/presence/seances/{seance_id}/export")
async def export_seance(
    seance_id: int,
    format: str = "pdf",
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if format == "xlsx":
        buffer, filename = await service.export_seance_excel(db, seance_id)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        buffer, filename = await service.export_seance_pdf(db, seance_id)
        media_type = "application/pdf"
    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# --- Public (QR scan, sans authentification) ---


@router.get("/presence/public/{token}", response_model=PublicSeanceInfo)
async def public_seance_info(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> PublicSeanceInfo:
    return await service.get_public_seance_info(db, token)


@router.post("/presence/public/{token}/checkin", response_model=CheckInResponse)
async def public_check_in(
    token: str,
    body: CheckInRequest,
    db: AsyncSession = Depends(get_db),
) -> CheckInResponse:
    return await service.check_in(db, token, body.code)
