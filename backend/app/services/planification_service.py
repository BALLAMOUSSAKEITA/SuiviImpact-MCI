from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.direction import Direction
from app.models.plan_action import Activite, ActiviteDirection, ActiviteTrimestre
from app.models.tache import TRIMESTRE_MOIS, Tache, TacheSemaine, TacheStatut, end_of_week_in_month
from app.schemas.planification import (
    PlanificationActiviteRead,
    SemaineRead,
    TacheCreate,
    TacheFichierRead,
    TacheRead,
    TacheUpdate,
)


def tache_to_read(tache: Tache) -> TacheRead:
    return TacheRead(
        id=tache.id,
        activite_id=tache.activite_id,
        trimestre=tache.trimestre,
        annee=tache.annee,
        description=tache.description,
        responsable=tache.responsable,
        email_responsable=tache.email_responsable,
        ponderation=tache.ponderation,
        statut=tache.statut.value,
        observation=tache.observation,
        semaines=[
            SemaineRead(
                id=s.id,
                mois=s.mois,
                semaine=s.semaine,
                planifie=s.planifie,
                date_fin_semaine=s.date_fin_semaine,
            )
            for s in tache.semaines
        ],
        fichiers=[
            TacheFichierRead(
                id=f.id,
                nom_original=f.nom_original,
                mime_type=f.mime_type,
                taille=f.taille,
                uploaded_at=f.uploaded_at,
            )
            for f in tache.fichiers
        ],
        created_at=tache.created_at,
        updated_at=tache.updated_at,
    )


def _validate_semaines_trimestre(trimestre: int, semaines: list) -> None:
    allowed_mois = TRIMESTRE_MOIS.get(trimestre, [])
    for semaine in semaines:
        if semaine.mois not in allowed_mois:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le mois {semaine.mois} n'appartient pas au trimestre {trimestre}",
            )


async def _sum_ponderation_non_terminee(
    db: AsyncSession,
    activite_id: int,
    exclude_tache_id: int | None = None,
) -> Decimal:
    query = select(func.coalesce(func.sum(Tache.ponderation), 0)).where(
        Tache.activite_id == activite_id,
        Tache.statut != TacheStatut.TERMINEE,
    )
    if exclude_tache_id is not None:
        query = query.where(Tache.id != exclude_tache_id)
    result = await db.execute(query)
    return Decimal(str(result.scalar_one()))


async def _validate_ponderation(
    db: AsyncSession,
    activite_id: int,
    ponderation: Decimal,
    exclude_tache_id: int | None = None,
) -> None:
    total = await _sum_ponderation_non_terminee(db, activite_id, exclude_tache_id)
    if total + ponderation > Decimal("100"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pondération cumulée dépassée ({total + ponderation}% > 100%)",
        )


def _build_semaines(tache_id: int, annee: int, semaines: list) -> list[TacheSemaine]:
    return [
        TacheSemaine(
            tache_id=tache_id,
            mois=s.mois,
            semaine=s.semaine,
            planifie=True,
            date_fin_semaine=end_of_week_in_month(annee, s.mois, s.semaine),
        )
        for s in semaines
    ]


async def list_planification(
    db: AsyncSession,
    annee: int,
    trimestre: int,
    direction_code: str | None = None,
) -> list[PlanificationActiviteRead]:
    query = (
        select(Activite)
        .join(ActiviteTrimestre, Activite.id == ActiviteTrimestre.activite_id)
        .where(
            ActiviteTrimestre.annee == annee,
            ActiviteTrimestre.trimestre == trimestre,
            ActiviteTrimestre.planifie.is_(True),
        )
        .options(selectinload(Activite.directions))
        .order_by(Activite.code)
    )

    if direction_code:
        query = (
            query.join(ActiviteDirection, Activite.id == ActiviteDirection.activite_id)
            .join(Direction, ActiviteDirection.direction_id == Direction.id)
            .where(Direction.code == direction_code)
        )

    result = await db.execute(query)
    activites = result.scalars().unique().all()

    counts: dict[int, int] = {}
    if activites:
        activite_ids = [a.id for a in activites]
        count_result = await db.execute(
            select(Tache.activite_id, func.count(Tache.id))
            .where(
                Tache.activite_id.in_(activite_ids),
                Tache.annee == annee,
                Tache.trimestre == trimestre,
            )
            .group_by(Tache.activite_id)
        )
        counts = {row[0]: row[1] for row in count_result.all()}

    return [
        PlanificationActiviteRead(
            id=a.id,
            code=a.code,
            description=a.description,
            execution=a.execution,
            budget=a.budget,
            objectif_id=a.objectif_id,
            direction_ids=[d.direction_id for d in a.directions],
            nb_taches=counts.get(a.id, 0),
        )
        for a in activites
    ]


async def get_tache(db: AsyncSession, tache_id: int) -> Tache | None:
    result = await db.execute(
        select(Tache)
        .where(Tache.id == tache_id)
        .options(selectinload(Tache.semaines), selectinload(Tache.fichiers))
    )
    return result.scalar_one_or_none()


async def list_taches_by_activite(
    db: AsyncSession,
    activite_id: int,
    trimestre: int,
    annee: int,
) -> list[TacheRead]:
    result = await db.execute(
        select(Tache)
        .where(
            Tache.activite_id == activite_id,
            Tache.trimestre == trimestre,
            Tache.annee == annee,
        )
        .options(selectinload(Tache.semaines), selectinload(Tache.fichiers))
        .order_by(Tache.id)
    )
    return [tache_to_read(t) for t in result.scalars().all()]


async def create_tache(
    db: AsyncSession,
    activite_id: int,
    data: TacheCreate,
) -> TacheRead:
    activite = await db.get(Activite, activite_id)
    if activite is None:
        raise HTTPException(status_code=404, detail="Activité introuvable")

    _validate_semaines_trimestre(data.trimestre, data.semaines)
    await _validate_ponderation(db, activite_id, data.ponderation)

    tache = Tache(
        activite_id=activite_id,
        trimestre=data.trimestre,
        annee=data.annee,
        description=data.description,
        responsable=data.responsable,
        email_responsable=data.email_responsable,
        ponderation=data.ponderation,
        statut=TacheStatut.EN_COURS,
    )
    db.add(tache)
    await db.flush()

    for semaine in _build_semaines(tache.id, data.annee, data.semaines):
        db.add(semaine)

    await db.commit()
    loaded = await get_tache(db, tache.id)
    assert loaded is not None
    return tache_to_read(loaded)


async def update_tache(
    db: AsyncSession,
    tache: Tache,
    data: TacheUpdate,
) -> TacheRead:
    if data.ponderation is not None and tache.statut != TacheStatut.TERMINEE:
        await _validate_ponderation(db, tache.activite_id, data.ponderation, tache.id)

    if data.description is not None:
        tache.description = data.description
    if data.responsable is not None:
        tache.responsable = data.responsable
    if data.email_responsable is not None:
        tache.email_responsable = data.email_responsable
    if data.ponderation is not None:
        tache.ponderation = data.ponderation

    if data.semaines is not None:
        _validate_semaines_trimestre(tache.trimestre, data.semaines)
        for old in list(tache.semaines):
            await db.delete(old)
        await db.flush()
        for semaine in _build_semaines(tache.id, tache.annee, data.semaines):
            db.add(semaine)

    await db.commit()
    loaded = await get_tache(db, tache.id)
    assert loaded is not None
    return tache_to_read(loaded)


async def delete_tache(db: AsyncSession, tache: Tache) -> None:
    await db.delete(tache)
    await db.commit()
