from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.plan_action import (
    Activite,
    ActiviteDirection,
    ActiviteTrimestre,
    Objectif,
)
from app.schemas.plan_action import (
    ActiviteCreate,
    ActiviteRead,
    ActiviteUpdate,
    ObjectifCreate,
    ObjectifRead,
    ObjectifUpdate,
    TrimestrePlan,
)


def activite_to_read(activite: Activite) -> ActiviteRead:
    return ActiviteRead(
        id=activite.id,
        objectif_id=activite.objectif_id,
        code=activite.code,
        description=activite.description,
        budget=activite.budget,
        execution=activite.execution,
        direction_ids=[d.direction_id for d in activite.directions],
        trimestres=[
            TrimestrePlan(annee=t.annee, trimestre=t.trimestre)
            for t in activite.trimestres
            if t.planifie
        ],
        created_at=activite.created_at,
        updated_at=activite.updated_at,
    )


async def list_objectifs(db: AsyncSession) -> list[ObjectifRead]:
    result = await db.execute(select(Objectif).order_by(Objectif.code))
    return list(result.scalars().all())


async def get_objectif(db: AsyncSession, objectif_id: int) -> Objectif | None:
    result = await db.execute(select(Objectif).where(Objectif.id == objectif_id))
    return result.scalar_one_or_none()


async def create_objectif(db: AsyncSession, data: ObjectifCreate) -> Objectif:
    objectif = Objectif(code=data.code, description=data.description)
    db.add(objectif)
    await db.commit()
    await db.refresh(objectif)
    return objectif


async def update_objectif(
    db: AsyncSession, objectif: Objectif, data: ObjectifUpdate
) -> Objectif:
    if data.code is not None:
        objectif.code = data.code
    if data.description is not None:
        objectif.description = data.description
    await db.commit()
    await db.refresh(objectif)
    return objectif


async def delete_objectif(db: AsyncSession, objectif: Objectif) -> None:
    await db.delete(objectif)
    await db.commit()


async def list_activites_by_objectif(
    db: AsyncSession, objectif_id: int
) -> list[ActiviteRead]:
    result = await db.execute(
        select(Activite)
        .where(Activite.objectif_id == objectif_id)
        .options(
            selectinload(Activite.trimestres),
            selectinload(Activite.directions),
        )
        .order_by(Activite.code)
    )
    return [activite_to_read(a) for a in result.scalars().all()]


async def get_activite(db: AsyncSession, activite_id: int) -> Activite | None:
    result = await db.execute(
        select(Activite)
        .where(Activite.id == activite_id)
        .options(
            selectinload(Activite.trimestres),
            selectinload(Activite.directions),
        )
    )
    return result.scalar_one_or_none()


async def list_activites_by_statut(
    db: AsyncSession, statut: str
) -> list[ActiviteRead]:
    result = await db.execute(
        select(Activite).options(
            selectinload(Activite.trimestres),
            selectinload(Activite.directions),
        )
    )
    activites = result.scalars().all()
    filtered: list[Activite] = []

    for activite in activites:
        execution = float(activite.execution)
        if statut == "non_demare" and execution == 0:
            filtered.append(activite)
        elif statut == "en_cours" and 0 < execution < 100:
            filtered.append(activite)
        elif statut == "termine" and execution == 100:
            filtered.append(activite)

    return [activite_to_read(a) for a in filtered]


async def _apply_activite_relations(
    db: AsyncSession,
    activite_id: int,
    direction_ids: list[int],
    trimestres: list[TrimestrePlan],
) -> None:
    for direction_id in direction_ids:
        db.add(ActiviteDirection(activite_id=activite_id, direction_id=direction_id))
    for trimestre in trimestres:
        db.add(
            ActiviteTrimestre(
                activite_id=activite_id,
                annee=trimestre.annee,
                trimestre=trimestre.trimestre,
                planifie=True,
            )
        )


async def create_activite(
    db: AsyncSession, objectif_id: int, data: ActiviteCreate
) -> ActiviteRead:
    activite = Activite(
        objectif_id=objectif_id,
        code=data.code,
        description=data.description,
        budget=data.budget,
        execution=Decimal("0"),
    )
    db.add(activite)
    await db.flush()
    await _apply_activite_relations(db, activite.id, data.direction_ids, data.trimestres)
    await db.commit()
    loaded = await get_activite(db, activite.id)
    assert loaded is not None
    return activite_to_read(loaded)


async def update_activite(
    db: AsyncSession, activite: Activite, data: ActiviteUpdate
) -> ActiviteRead:
    if data.code is not None:
        activite.code = data.code
    if data.description is not None:
        activite.description = data.description
    if data.budget is not None:
        activite.budget = data.budget
    if data.direction_ids is not None and data.trimestres is not None:
        for old in list(activite.directions):
            await db.delete(old)
        for old in list(activite.trimestres):
            await db.delete(old)
        await db.flush()
        await _apply_activite_relations(
            db, activite.id, data.direction_ids, data.trimestres
        )
    elif data.direction_ids is not None:
        for old in list(activite.directions):
            await db.delete(old)
        await db.flush()
        await _apply_activite_relations(db, activite.id, data.direction_ids, [])
    elif data.trimestres is not None:
        for old in list(activite.trimestres):
            await db.delete(old)
        await db.flush()
        await _apply_activite_relations(db, activite.id, [], data.trimestres)

    await db.commit()
    loaded = await get_activite(db, activite.id)
    assert loaded is not None
    return activite_to_read(loaded)


async def delete_activite(db: AsyncSession, activite: Activite) -> None:
    await db.delete(activite)
    await db.commit()
