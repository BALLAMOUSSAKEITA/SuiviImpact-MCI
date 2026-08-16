import secrets
from datetime import UTC, date, datetime
from io import BytesIO

from fastapi import HTTPException, status
from openpyxl import Workbook
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.data.personnel_cabinet_seed import PERSONNEL_CABINET_SEED, code_for_num_ordre
from app.models.presence import (
    PersonnelCabinet,
    PresenceEnregistrement,
    SeancePresence,
    SeanceStatut,
)
from app.schemas.presence import (
    CheckInResponse,
    PersonnelCabinetCreate,
    PersonnelCabinetUpdate,
    PresenceEnregistrementRead,
    PublicSeanceInfo,
    SeancePresenceCreate,
    SeancePresenceDetail,
    SeancePresenceRead,
)
from app.services.excel_branding import (
    finalize_sheet,
    prepare_branded_sheet,
    write_row_cells,
)


def _generate_token() -> str:
    return secrets.token_urlsafe(32)


async def _count_personnel_actif(db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count()).select_from(PersonnelCabinet).where(PersonnelCabinet.actif.is_(True))
    )
    return int(result.scalar_one())


async def list_personnel(db: AsyncSession, actif_only: bool = False) -> list[PersonnelCabinet]:
    stmt = select(PersonnelCabinet).order_by(PersonnelCabinet.num_ordre)
    if actif_only:
        stmt = stmt.where(PersonnelCabinet.actif.is_(True))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_personnel(db: AsyncSession, personnel_id: int) -> PersonnelCabinet | None:
    result = await db.execute(
        select(PersonnelCabinet).where(PersonnelCabinet.id == personnel_id)
    )
    return result.scalar_one_or_none()


async def _assert_unique_personnel_fields(
    db: AsyncSession,
    *,
    num_ordre: int,
    code_presence: str,
    exclude_id: int | None = None,
) -> None:
    stmt_num = select(PersonnelCabinet).where(PersonnelCabinet.num_ordre == num_ordre)
    stmt_code = select(PersonnelCabinet).where(PersonnelCabinet.code_presence == code_presence)
    if exclude_id is not None:
        stmt_num = stmt_num.where(PersonnelCabinet.id != exclude_id)
        stmt_code = stmt_code.where(PersonnelCabinet.id != exclude_id)

    if (await db.execute(stmt_num)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ce numéro d'ordre existe déjà")
    if (await db.execute(stmt_code)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ce code de présence existe déjà")


async def create_personnel(db: AsyncSession, body: PersonnelCabinetCreate) -> PersonnelCabinet:
    await _assert_unique_personnel_fields(
        db, num_ordre=body.num_ordre, code_presence=body.code_presence
    )
    item = PersonnelCabinet(**body.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update_personnel(
    db: AsyncSession, item: PersonnelCabinet, body: PersonnelCabinetUpdate
) -> PersonnelCabinet:
    data = body.model_dump(exclude_unset=True)
    num_ordre = data.get("num_ordre", item.num_ordre)
    code_presence = data.get("code_presence", item.code_presence)
    await _assert_unique_personnel_fields(
        db, num_ordre=num_ordre, code_presence=code_presence, exclude_id=item.id
    )
    for key, value in data.items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


async def delete_personnel(db: AsyncSession, item: PersonnelCabinet) -> None:
    await db.delete(item)
    await db.commit()


async def seed_personnel_if_empty(db: AsyncSession) -> int:
    result = await db.execute(select(func.count()).select_from(PersonnelCabinet))
    if int(result.scalar_one()) > 0:
        return 0

    for row in PERSONNEL_CABINET_SEED:
        db.add(
            PersonnelCabinet(
                num_ordre=row["num_ordre"],
                nom_complet=row["nom_complet"],
                fonction=row["fonction"],
                contact=row["contact"],
                email=row["email"],
                categorie=row["categorie"],
                code_presence=code_for_num_ordre(row["num_ordre"]),
                actif=True,
            )
        )
    await db.commit()
    return len(PERSONNEL_CABINET_SEED)


def _seance_read(
    seance: SeancePresence, nb_presents: int, nb_personnel_actif: int
) -> SeancePresenceRead:
    return SeancePresenceRead(
        id=seance.id,
        titre=seance.titre,
        date_seance=seance.date_seance,
        token=seance.token,
        statut=seance.statut.value,
        created_at=seance.created_at,
        closed_at=seance.closed_at,
        nb_presents=nb_presents,
        nb_personnel_actif=nb_personnel_actif,
    )


async def list_seances(db: AsyncSession) -> list[SeancePresenceRead]:
    result = await db.execute(
        select(SeancePresence).order_by(SeancePresence.date_seance.desc(), SeancePresence.id.desc())
    )
    seances = list(result.scalars().all())
    nb_actif = await _count_personnel_actif(db)
    out: list[SeancePresenceRead] = []
    for seance in seances:
        count_result = await db.execute(
            select(func.count())
            .select_from(PresenceEnregistrement)
            .where(PresenceEnregistrement.seance_id == seance.id)
        )
        nb_presents = int(count_result.scalar_one())
        out.append(_seance_read(seance, nb_presents, nb_actif))
    return out


async def get_seance(db: AsyncSession, seance_id: int) -> SeancePresence | None:
    result = await db.execute(select(SeancePresence).where(SeancePresence.id == seance_id))
    return result.scalar_one_or_none()


async def get_seance_by_token(db: AsyncSession, token: str) -> SeancePresence | None:
    result = await db.execute(select(SeancePresence).where(SeancePresence.token == token))
    return result.scalar_one_or_none()


async def get_seance_detail(db: AsyncSession, seance_id: int) -> SeancePresenceDetail | None:
    seance = await get_seance(db, seance_id)
    if seance is None:
        return None

    result = await db.execute(
        select(PresenceEnregistrement)
        .where(PresenceEnregistrement.seance_id == seance_id)
        .options(selectinload(PresenceEnregistrement.personnel))
        .order_by(PresenceEnregistrement.pointe_a)
    )
    presences = list(result.scalars().all())
    nb_actif = await _count_personnel_actif(db)

    return SeancePresenceDetail(
        **_seance_read(seance, len(presences), nb_actif).model_dump(),
        presences=[
            PresenceEnregistrementRead(
                id=p.id,
                personnel_id=p.personnel_id,
                nom_complet=p.personnel.nom_complet,
                fonction=p.personnel.fonction,
                categorie=p.personnel.categorie,
                contact=p.personnel.contact,
                email=p.personnel.email,
                pointe_a=p.pointe_a,
            )
            for p in presences
        ],
    )


async def create_seance(
    db: AsyncSession, body: SeancePresenceCreate, created_by: int | None
) -> SeancePresenceRead:
    seance = SeancePresence(
        titre=body.titre.strip(),
        date_seance=body.date_seance,
        token=_generate_token(),
        statut=SeanceStatut.OUVERTE,
        created_by=created_by,
    )
    db.add(seance)
    await db.commit()
    await db.refresh(seance)
    nb_actif = await _count_personnel_actif(db)
    return _seance_read(seance, 0, nb_actif)


async def close_seance(db: AsyncSession, seance: SeancePresence) -> SeancePresenceRead:
    if seance.statut == SeanceStatut.FERMEE:
        raise HTTPException(status_code=400, detail="Cette séance est déjà clôturée")
    seance.statut = SeanceStatut.FERMEE
    seance.closed_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(seance)
    count_result = await db.execute(
        select(func.count())
        .select_from(PresenceEnregistrement)
        .where(PresenceEnregistrement.seance_id == seance.id)
    )
    nb_actif = await _count_personnel_actif(db)
    return _seance_read(seance, int(count_result.scalar_one()), nb_actif)


async def delete_seance(db: AsyncSession, seance: SeancePresence) -> None:
    await db.delete(seance)
    await db.commit()


async def get_public_seance_info(db: AsyncSession, token: str) -> PublicSeanceInfo:
    seance = await get_seance_by_token(db, token)
    if seance is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    return PublicSeanceInfo(
        titre=seance.titre,
        date_seance=seance.date_seance,
        statut=seance.statut.value,
    )


async def check_in(db: AsyncSession, token: str, code: str) -> CheckInResponse:
    seance = await get_seance_by_token(db, token)
    if seance is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")
    if seance.statut != SeanceStatut.OUVERTE:
        return CheckInResponse(
            success=False,
            message="Cette réunion est terminée. Le pointage n'est plus possible.",
            deja_pointe=False,
        )

    personnel_result = await db.execute(
        select(PersonnelCabinet).where(
            PersonnelCabinet.code_presence == code,
            PersonnelCabinet.actif.is_(True),
        )
    )
    personnel = personnel_result.scalar_one_or_none()
    if personnel is None:
        return CheckInResponse(
            success=False,
            message="Code incorrect. Vérifiez votre code à 4 chiffres.",
            deja_pointe=False,
        )

    existing = await db.execute(
        select(PresenceEnregistrement).where(
            PresenceEnregistrement.seance_id == seance.id,
            PresenceEnregistrement.personnel_id == personnel.id,
        )
    )
    if existing.scalar_one_or_none():
        return CheckInResponse(
            success=True,
            message=f"Vous êtes déjà enregistré(e), {personnel.nom_complet}.",
            nom_complet=personnel.nom_complet,
            deja_pointe=True,
        )

    enregistrement = PresenceEnregistrement(seance_id=seance.id, personnel_id=personnel.id)
    db.add(enregistrement)
    await db.commit()
    await db.refresh(enregistrement)

    return CheckInResponse(
        success=True,
        message=f"Présence enregistrée. Merci, {personnel.nom_complet}.",
        nom_complet=personnel.nom_complet,
        pointe_a=enregistrement.pointe_a,
        deja_pointe=False,
    )


async def export_seance_excel(db: AsyncSession, seance_id: int) -> tuple[BytesIO, str]:
    detail = await get_seance_detail(db, seance_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Séance introuvable")

    wb = Workbook()
    ws = wb.active
    ws.title = "Présences"
    headers = ["N°", "Nom complet", "Fonction", "Catégorie", "Contact", "E-mail", "Heure de pointage"]
    start = prepare_branded_sheet(
        ws,
        report_title=f"Liste de présence — {detail.titre}",
        subtitle=f"Date : {detail.date_seance.strftime('%d/%m/%Y')}",
        headers=headers,
    )
    for i, p in enumerate(detail.presences):
        write_row_cells(
            ws,
            start + i,
            (
                i + 1,
                p.nom_complet,
                p.fonction,
                p.categorie,
                p.contact or "",
                p.email or "",
                p.pointe_a.astimezone(UTC).strftime("%H:%M:%S"),
            ),
            zebra_index=i,
        )
    finalize_sheet(ws, len(headers))

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    filename = f"presence_conseil_{detail.date_seance.isoformat()}.xlsx"
    return buffer, filename
