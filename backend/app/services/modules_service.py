from datetime import date
from decimal import Decimal
from typing import Any, TypeVar

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.years import MAX_ANNEE, MIN_ANNEE
from app.models.direction import Direction
from app.models.modules import (
    Indicateur,
    Mission,
    Ppm,
    PpmStatut,
    Projet,
    Recommandation,
)
from app.schemas.modules import (
    IndicateurCreate,
    IndicateurRead,
    IndicateurUpdate,
    MissionCreate,
    MissionRead,
    MissionUpdate,
    ModuleListResponse,
    PpmCreate,
    PpmRead,
    PpmUpdate,
    ProjetCreate,
    ProjetRead,
    ProjetType,
    ProjetUpdate,
    RecommandationCreate,
    RecommandationRead,
    RecommandationUpdate,
)

T = TypeVar("T")


def _period_from_date(d: date) -> tuple[int, int]:
    if d.year < MIN_ANNEE or d.year > MAX_ANNEE:
        raise HTTPException(
            status_code=400,
            detail=f"L'année doit être entre {MIN_ANNEE} et {MAX_ANNEE}",
        )
    return d.year, (d.month - 1) // 3 + 1


def _execution_statut_filter(model: type, statut: str):
    execution = model.execution
    if statut in ("non_execute", "non_demare"):
        return execution == 0
    if statut == "en_cours":
        return (execution > 0) & (execution < 100)
    if statut == "termine":
        return execution == 100
    raise HTTPException(status_code=400, detail=f"Statut invalide: {statut}")


def _avg_execution(items: list[Any]) -> Decimal | None:
    if not items:
        return None
    total = sum(Decimal(str(i.execution)) for i in items)
    return (total / len(items)).quantize(Decimal("0.01"))


async def _list_with_avg(
    db: AsyncSession,
    model: type[T],
    filters: list,
    order_by,
) -> ModuleListResponse:
    query = select(model)
    for f in filters:
        query = query.where(f)
    query = query.order_by(order_by)
    result = await db.execute(query)
    items = list(result.scalars().all())
    avg = _avg_execution(items)
    read_model = {
        Recommandation: RecommandationRead,
        Mission: MissionRead,
    }[model]
    return ModuleListResponse(
        items=[read_model.model_validate(i) for i in items],
        avg_execution=avg,
    )


async def list_recommandations(
    db: AsyncSession,
    trimestre: int | None = None,
    annee: int | None = None,
    statut: str | None = None,
) -> ModuleListResponse:
    filters = []
    if trimestre is not None:
        filters.append(Recommandation.trimestre == trimestre)
    if annee is not None:
        filters.append(Recommandation.annee == annee)
    if statut is not None:
        filters.append(_execution_statut_filter(Recommandation, statut))
    return await _list_with_avg(
        db, Recommandation, filters, Recommandation.date_recommandation.desc()
    )


async def get_recommandation(db: AsyncSession, item_id: int) -> Recommandation | None:
    return await db.get(Recommandation, item_id)


async def create_recommandation(
    db: AsyncSession, data: RecommandationCreate
) -> RecommandationRead:
    payload = data.model_dump()
    payload["annee"], payload["trimestre"] = _period_from_date(data.date_recommandation)
    item = Recommandation(**payload)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return RecommandationRead.model_validate(item)


async def update_recommandation(
    db: AsyncSession, item: Recommandation, data: RecommandationUpdate
) -> RecommandationRead:
    payload = data.model_dump(exclude_unset=True)
    if "date_recommandation" in payload:
        payload["annee"], payload["trimestre"] = _period_from_date(
            payload["date_recommandation"]
        )
    for field, value in payload.items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return RecommandationRead.model_validate(item)


async def delete_recommandation(db: AsyncSession, item: Recommandation) -> None:
    await db.delete(item)
    await db.commit()


async def finaliser_recommandation(
    db: AsyncSession, item: Recommandation
) -> RecommandationRead:
    item.execution = Decimal("100")
    await db.commit()
    await db.refresh(item)
    return RecommandationRead.model_validate(item)


async def list_missions(
    db: AsyncSession,
    trimestre: int | None = None,
    annee: int | None = None,
    statut: str | None = None,
) -> ModuleListResponse:
    filters = []
    if trimestre is not None:
        filters.append(Mission.trimestre == trimestre)
    if annee is not None:
        filters.append(Mission.annee == annee)
    if statut is not None:
        filters.append(_execution_statut_filter(Mission, statut))
    return await _list_with_avg(db, Mission, filters, Mission.date_mission.desc())


async def get_mission(db: AsyncSession, item_id: int) -> Mission | None:
    return await db.get(Mission, item_id)


async def create_mission(db: AsyncSession, data: MissionCreate) -> MissionRead:
    payload = data.model_dump()
    payload["annee"], payload["trimestre"] = _period_from_date(data.date_mission)
    item = Mission(**payload)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return MissionRead.model_validate(item)


async def update_mission(
    db: AsyncSession, item: Mission, data: MissionUpdate
) -> MissionRead:
    payload = data.model_dump(exclude_unset=True)
    if "date_mission" in payload:
        payload["annee"], payload["trimestre"] = _period_from_date(payload["date_mission"])
    for field, value in payload.items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return MissionRead.model_validate(item)


async def delete_mission(db: AsyncSession, item: Mission) -> None:
    await db.delete(item)
    await db.commit()


async def finaliser_mission(db: AsyncSession, item: Mission) -> MissionRead:
    item.execution = Decimal("100")
    await db.commit()
    await db.refresh(item)
    return MissionRead.model_validate(item)


async def list_ppm(
    db: AsyncSession,
    type_marche: str | None = None,
    statut: PpmStatut | None = None,
) -> list[PpmRead]:
    query = select(Ppm).order_by(Ppm.id)
    if type_marche:
        query = query.where(Ppm.type_marche == type_marche)
    if statut:
        query = query.where(Ppm.statut == statut)
    result = await db.execute(query)
    return [PpmRead.model_validate(i) for i in result.scalars().all()]


async def get_ppm(db: AsyncSession, item_id: int) -> Ppm | None:
    return await db.get(Ppm, item_id)


async def create_ppm(db: AsyncSession, data: PpmCreate) -> PpmRead:
    item = Ppm(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return PpmRead.model_validate(item)


async def update_ppm(db: AsyncSession, item: Ppm, data: PpmUpdate) -> PpmRead:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return PpmRead.model_validate(item)


async def delete_ppm(db: AsyncSession, item: Ppm) -> None:
    await db.delete(item)
    await db.commit()


async def list_projets(
    db: AsyncSession,
    statut: str | None = None,
    type_projet: ProjetType | None = None,
) -> list[ProjetRead]:
    query = select(Projet).order_by(Projet.id)
    if type_projet is not None:
        query = query.where(Projet.type_projet == type_projet)
    if statut is not None:
        execution = Projet.execution_physique
        if statut in ("non_execute", "non_demare"):
            query = query.where(execution == 0)
        elif statut == "en_cours":
            query = query.where((execution > 0) & (execution < 100))
        elif statut == "termine":
            query = query.where(execution == 100)
        else:
            raise HTTPException(status_code=400, detail=f"Statut invalide: {statut}")
    result = await db.execute(query)
    return [ProjetRead.model_validate(i) for i in result.scalars().all()]


async def get_projet(db: AsyncSession, item_id: int) -> Projet | None:
    return await db.get(Projet, item_id)


async def _assert_projet_code_available(db: AsyncSession, code: str) -> None:
    result = await db.execute(select(Projet.id).where(Projet.code == code).limit(1))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=400, detail="Ce code projet existe déjà")


async def create_projet(db: AsyncSession, data: ProjetCreate) -> ProjetRead:
    code = data.code.strip()
    if not code:
        raise HTTPException(status_code=400, detail="Le code projet est requis")
    await _assert_projet_code_available(db, code)
    item = Projet(
        code=code,
        description=data.description.strip(),
        type_projet=data.type_projet,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return ProjetRead.model_validate(item)


async def update_projet(db: AsyncSession, item: Projet, data: ProjetUpdate) -> ProjetRead:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return ProjetRead.model_validate(item)


async def delete_projet(db: AsyncSession, item: Projet) -> None:
    await db.delete(item)
    await db.commit()


def _to_indicateur_read(
    item: Indicateur, direction: Direction | None = None
) -> IndicateurRead:
    return IndicateurRead(
        id=item.id,
        code=item.code,
        libelle=item.libelle,
        nombre_unites=item.nombre_unites,
        direction_id=item.direction_id,
        direction_code=direction.code if direction else None,
        direction_libelle=direction.libelle if direction else None,
        reference=item.reference,
        cible=item.cible,
        realise=item.realise,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


async def _get_direction(
    db: AsyncSession, direction_id: int | None
) -> Direction | None:
    if direction_id is None:
        return None
    direction = await db.get(Direction, direction_id)
    if direction is None:
        raise HTTPException(status_code=404, detail="Direction introuvable")
    return direction


async def list_indicateurs(db: AsyncSession) -> list[IndicateurRead]:
    result = await db.execute(
        select(Indicateur, Direction)
        .outerjoin(Direction, Indicateur.direction_id == Direction.id)
        .order_by(Indicateur.code)
    )
    return [_to_indicateur_read(item, direction) for item, direction in result.all()]


async def get_indicateur(db: AsyncSession, item_id: int) -> Indicateur | None:
    return await db.get(Indicateur, item_id)


async def get_indicateur_read(db: AsyncSession, item_id: int) -> IndicateurRead | None:
    result = await db.execute(
        select(Indicateur, Direction)
        .outerjoin(Direction, Indicateur.direction_id == Direction.id)
        .where(Indicateur.id == item_id)
    )
    row = result.first()
    if row is None:
        return None
    item, direction = row
    return _to_indicateur_read(item, direction)


async def create_indicateur(db: AsyncSession, data: IndicateurCreate) -> IndicateurRead:
    direction = await _get_direction(db, data.direction_id)
    item = Indicateur(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _to_indicateur_read(item, direction)


async def update_indicateur(
    db: AsyncSession, item: Indicateur, data: IndicateurUpdate
) -> IndicateurRead:
    payload = data.model_dump(exclude_unset=True)
    if "direction_id" in payload:
        await _get_direction(db, payload["direction_id"])
    for field, value in payload.items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    direction = await _get_direction(db, item.direction_id)
    return _to_indicateur_read(item, direction)


async def delete_indicateur(db: AsyncSession, item: Indicateur) -> None:
    await db.delete(item)
    await db.commit()
