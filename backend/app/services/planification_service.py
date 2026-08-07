from datetime import date
from decimal import Decimal
import secrets

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import delete, func, inspect as sa_inspect, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.direction import Direction
from app.models.plan_action import Activite, ActiviteDirection, ActiviteTrimestre, Objectif, TachePlan
from app.models.tache import TRIMESTRE_MOIS, Tache, TacheSemaine, TacheStatut, end_of_week_in_month
from app.models.modules import Projet
from app.models.planification_projet import (
    PlanificationProjet,
    PlanificationProjetActivite,
    PlanificationProjetComposante,
)
from app.schemas.planification import (
    PAO_PONDERATIONS,
    PlanificationActiviteRead,
    PlanificationPaoCreate,
    PlanificationPaoRead,
    PlanificationPaoTacheRead,
    PlanificationPaoUpdate,
    PlanificationProjetCreate,
    PlanificationProjetRead,
    PlanificationProjetUpdate,
    PlanificationProjetComposanteRead,
    PlanificationProjetActiviteRead,
    SemaineRead,
    TacheCreate,
    TacheFichierRead,
    TacheRead,
    TacheUpdate,
    TypeBudgetProjet,
)
from app.services.storage_service import storage_service


DOCUMENT_MEDIA_TYPES: dict[str, str] = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}


def guess_document_media_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return DOCUMENT_MEDIA_TYPES.get(ext, "application/octet-stream")


async def get_pao_activite_for_tdr(db: AsyncSession, activite_id: int) -> Activite:
    activite = await db.get(Activite, activite_id)
    if activite is None or activite.date_debut is None:
        raise HTTPException(status_code=404, detail="Activité planifiée introuvable")
    if not activite.tdr_chemin:
        raise HTTPException(status_code=404, detail="Aucun TDR joint à cette activité")
    return activite


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


def _trimestre_from_date(d: date) -> tuple[int, int]:
    annee = d.year
    if annee < 2025 or annee > 2027:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'année doit être entre 2025 et 2027",
        )
    trimestre = (d.month - 1) // 3 + 1
    return annee, trimestre


def _trimestres_between(debut: date, fin: date) -> list[tuple[int, int]]:
    if fin < debut:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La date de fin doit être postérieure ou égale à la date de début",
        )
    seen: set[tuple[int, int]] = set()
    y, t = _trimestre_from_date(debut)
    y_end, t_end = _trimestre_from_date(fin)
    while (y, t) <= (y_end, t_end):
        seen.add((y, t))
        t += 1
        if t > 4:
            t = 1
            y += 1
    return sorted(seen)


async def _generate_activite_code(db: AsyncSession) -> str:
    for _ in range(20):
        code = secrets.token_hex(4).upper()
        existing = await db.execute(select(Activite.id).where(Activite.code == code))
        if existing.scalar_one_or_none() is None:
            return code
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Impossible de générer un code d'activité unique",
    )


def _validate_pao_taches(taches: list) -> None:
    if len(taches) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 tâches par activité",
        )
    ids = [t.tache_plan_id for t in taches]
    if len(ids) != len(set(ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chaque tâche du plan d'action ne peut être sélectionnée qu'une fois",
        )
    total = Decimal("0")
    for item in taches:
        p = Decimal(str(item.ponderation))
        if float(p) not in PAO_PONDERATIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Pondération invalide ({p}%). Valeurs autorisées : 5, 15, 25, 45, 50, 60",
            )
        total += p
    if total > Decimal("100"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La somme des pondérations ne peut pas dépasser 100% ({total}%)",
        )


async def _load_tache_plans(db: AsyncSession, taches: list) -> dict[int, TachePlan]:
    tache_plans: dict[int, TachePlan] = {}
    for item in taches:
        if item.tache_plan_id in tache_plans:
            continue
        tp = await db.get(TachePlan, item.tache_plan_id)
        if tp is None:
            raise HTTPException(
                status_code=404,
                detail=f"Tâche plan {item.tache_plan_id} introuvable",
            )
        tache_plans[item.tache_plan_id] = tp
    return tache_plans


async def _get_pao_activite_or_404(db: AsyncSession, activite_id: int) -> Activite:
    result = await db.execute(
        select(Activite)
        .where(Activite.id == activite_id, Activite.date_debut.isnot(None))
        .options(selectinload(Activite.directions))
    )
    activite = result.scalar_one_or_none()
    if activite is None:
        raise HTTPException(status_code=404, detail="Activité planifiée introuvable")
    return activite


async def _load_pao_activite_read(
    db: AsyncSession, activite_id: int
) -> PlanificationPaoRead:
    items = await list_pao_activites(db)
    for item in items:
        if item.id == activite_id:
            return item
    raise HTTPException(status_code=404, detail="Activité planifiée introuvable")


async def _sync_activite_trimestres(
    db: AsyncSession, activite_id: int, date_debut: date, date_fin: date
) -> None:
    await db.execute(
        delete(ActiviteTrimestre).where(ActiviteTrimestre.activite_id == activite_id)
    )
    for an, tr in _trimestres_between(date_debut, date_fin):
        db.add(
            ActiviteTrimestre(
                activite_id=activite_id,
                annee=an,
                trimestre=tr,
                planifie=True,
            )
        )


async def _sync_pao_plan_taches(
    db: AsyncSession,
    activite: Activite,
    data: PlanificationPaoCreate,
    direction: Direction,
    tache_plans: dict[int, TachePlan],
) -> None:
    annee, trimestre = _trimestre_from_date(data.date_debut)
    responsable_label = direction.libelle[:100]

    result = await db.execute(
        select(Tache).where(
            Tache.activite_id == activite.id,
            Tache.tache_plan_id.isnot(None),
        )
    )
    existing = {t.tache_plan_id: t for t in result.scalars().all()}
    new_ids = {item.tache_plan_id for item in data.taches}

    for plan_id, tache in existing.items():
        if plan_id not in new_ids:
            if tache.statut == TacheStatut.TERMINEE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Impossible de retirer une tâche déjà terminée au suivi",
                )
            await db.delete(tache)

    for item in data.taches:
        tp = tache_plans[item.tache_plan_id]
        desc = f"{tp.code} — {tp.description}"
        ponderation = Decimal(str(item.ponderation))
        if item.tache_plan_id in existing:
            tache = existing[item.tache_plan_id]
            tache.description = desc
            tache.responsable = responsable_label
            tache.email_responsable = data.email_responsable
            tache.ponderation = ponderation
            tache.trimestre = trimestre
            tache.annee = annee
        else:
            db.add(
                Tache(
                    activite_id=activite.id,
                    tache_plan_id=tp.id,
                    trimestre=trimestre,
                    annee=annee,
                    description=desc,
                    responsable=responsable_label,
                    email_responsable=data.email_responsable,
                    ponderation=ponderation,
                    statut=TacheStatut.EN_COURS,
                )
            )


async def create_pao_activite(
    db: AsyncSession,
    data: PlanificationPaoCreate,
    tdr_file: UploadFile | None = None,
) -> PlanificationPaoRead:
    _validate_pao_taches(data.taches)

    objectif = await db.get(Objectif, data.objectif_id)
    if objectif is None:
        raise HTTPException(status_code=404, detail="Objectif introuvable")

    direction = await db.get(Direction, data.direction_id)
    if direction is None:
        raise HTTPException(status_code=404, detail="Direction introuvable")

    tache_plans: dict[int, TachePlan] = {}
    for item in data.taches:
        if item.tache_plan_id in tache_plans:
            continue
        tp = await db.get(TachePlan, item.tache_plan_id)
        if tp is None:
            raise HTTPException(
                status_code=404,
                detail=f"Tâche plan {item.tache_plan_id} introuvable",
            )
        tache_plans[item.tache_plan_id] = tp

    tdr_chemin: str | None = None
    tdr_nom: str | None = None
    if tdr_file is not None and tdr_file.filename:
        tdr_chemin, tdr_nom, _ = await storage_service.save_upload(tdr_file, "tdr")

    code = await _generate_activite_code(db)
    annee, trimestre = _trimestre_from_date(data.date_debut)

    activite = Activite(
        objectif_id=data.objectif_id,
        code=code,
        description=data.description,
        budget=data.budget,
        execution=Decimal("0"),
        date_debut=data.date_debut,
        date_fin=data.date_fin,
        email_responsable=data.email_responsable,
        email_ministre=data.email_ministre,
        tdr_chemin=tdr_chemin,
        tdr_nom_original=tdr_nom,
    )
    db.add(activite)
    await db.flush()

    db.add(ActiviteDirection(activite_id=activite.id, direction_id=data.direction_id))
    for an, tr in _trimestres_between(data.date_debut, data.date_fin):
        db.add(
            ActiviteTrimestre(
                activite_id=activite.id,
                annee=an,
                trimestre=tr,
                planifie=True,
            )
        )

    responsable_label = direction.libelle[:100]
    taches_read: list[PlanificationPaoTacheRead] = []
    for item in data.taches:
        tp = tache_plans[item.tache_plan_id]
        desc = f"{tp.code} — {tp.description}"
        tache = Tache(
            activite_id=activite.id,
            tache_plan_id=tp.id,
            trimestre=trimestre,
            annee=annee,
            description=desc,
            responsable=responsable_label,
            email_responsable=data.email_responsable,
            ponderation=Decimal(str(item.ponderation)),
            statut=TacheStatut.EN_COURS,
        )
        db.add(tache)
        taches_read.append(
            PlanificationPaoTacheRead(
                tache_plan_id=tp.id,
                tache_plan_code=tp.code,
                tache_plan_description=tp.description,
                ponderation=Decimal(str(item.ponderation)),
            )
        )

    await db.commit()
    await db.refresh(activite)

    return PlanificationPaoRead(
        id=activite.id,
        code=activite.code,
        description=activite.description,
        budget=activite.budget,
        objectif_id=objectif.id,
        objectif_code=objectif.code,
        objectif_description=objectif.description,
        date_debut=data.date_debut,
        date_fin=data.date_fin,
        direction_id=direction.id,
        direction_code=direction.code,
        direction_libelle=direction.libelle,
        email_responsable=data.email_responsable,
        email_ministre=data.email_ministre,
        tdr_nom_original=tdr_nom,
        taches=taches_read,
        created_at=activite.created_at,
    )


async def update_pao_activite(
    db: AsyncSession,
    activite_id: int,
    data: PlanificationPaoUpdate,
    tdr_file: UploadFile | None = None,
) -> PlanificationPaoRead:
    _validate_pao_taches(data.taches)

    activite = await _get_pao_activite_or_404(db, activite_id)

    objectif = await db.get(Objectif, data.objectif_id)
    if objectif is None:
        raise HTTPException(status_code=404, detail="Objectif introuvable")

    direction = await db.get(Direction, data.direction_id)
    if direction is None:
        raise HTTPException(status_code=404, detail="Direction introuvable")

    tache_plans = await _load_tache_plans(db, data.taches)

    if tdr_file is not None and tdr_file.filename:
        tdr_chemin, tdr_nom, _ = await storage_service.save_upload(tdr_file, "tdr")
        activite.tdr_chemin = tdr_chemin
        activite.tdr_nom_original = tdr_nom

    activite.objectif_id = data.objectif_id
    activite.description = data.description
    activite.budget = data.budget
    activite.date_debut = data.date_debut
    activite.date_fin = data.date_fin
    activite.email_responsable = data.email_responsable
    activite.email_ministre = data.email_ministre

    if activite.directions:
        current_dir_id = activite.directions[0].direction_id
        if current_dir_id != data.direction_id:
            for link in list(activite.directions):
                await db.delete(link)
            db.add(
                ActiviteDirection(activite_id=activite.id, direction_id=data.direction_id)
            )
    else:
        db.add(ActiviteDirection(activite_id=activite.id, direction_id=data.direction_id))

    await _sync_activite_trimestres(db, activite.id, data.date_debut, data.date_fin)
    await _sync_pao_plan_taches(db, activite, data, direction, tache_plans)

    await db.commit()
    return await _load_pao_activite_read(db, activite_id)


async def list_pao_activites(db: AsyncSession) -> list[PlanificationPaoRead]:
    result = await db.execute(
        select(Activite)
        .where(Activite.date_debut.isnot(None))
        .options(
            selectinload(Activite.objectif),
            selectinload(Activite.directions),
        )
        .order_by(Activite.created_at.desc())
    )
    activites = result.scalars().all()
    if not activites:
        return []

    activite_ids = [a.id for a in activites]
    taches_result = await db.execute(
        select(Tache).where(
            Tache.activite_id.in_(activite_ids),
            Tache.tache_plan_id.isnot(None),
        )
    )
    taches_by_activite: dict[int, list[Tache]] = {}
    tache_plan_ids = set()
    for t in taches_result.scalars().all():
        taches_by_activite.setdefault(t.activite_id, []).append(t)
        if t.tache_plan_id:
            tache_plan_ids.add(t.tache_plan_id)

    tp_map: dict[int, TachePlan] = {}
    if tache_plan_ids:
        tp_result = await db.execute(
            select(TachePlan).where(TachePlan.id.in_(tache_plan_ids))
        )
        tp_map = {tp.id: tp for tp in tp_result.scalars().all()}

    direction_ids = {
        d.direction_id for a in activites for d in a.directions
    }
    dir_map: dict[int, Direction] = {}
    if direction_ids:
        dir_result = await db.execute(
            select(Direction).where(Direction.id.in_(direction_ids))
        )
        dir_map = {d.id: d for d in dir_result.scalars().all()}

    out: list[PlanificationPaoRead] = []
    for a in activites:
        if a.date_debut is None or a.date_fin is None:
            continue
        dir_id = a.directions[0].direction_id if a.directions else 0
        direction = dir_map.get(dir_id)
        if direction is None or a.objectif is None:
            continue
        taches_read: list[PlanificationPaoTacheRead] = []
        for t in taches_by_activite.get(a.id, []):
            tp = tp_map.get(t.tache_plan_id) if t.tache_plan_id else None
            if tp is None:
                continue
            taches_read.append(
                PlanificationPaoTacheRead(
                    tache_plan_id=tp.id,
                    tache_plan_code=tp.code,
                    tache_plan_description=tp.description,
                    ponderation=t.ponderation,
                )
            )
        out.append(
            PlanificationPaoRead(
                id=a.id,
                code=a.code,
                description=a.description,
                budget=a.budget,
                objectif_id=a.objectif_id,
                objectif_code=a.objectif.code,
                objectif_description=a.objectif.description,
                date_debut=a.date_debut,
                date_fin=a.date_fin,
                direction_id=direction.id,
                direction_code=direction.code,
                direction_libelle=direction.libelle,
                email_responsable=a.email_responsable or "",
                email_ministre=a.email_ministre or "",
                tdr_nom_original=a.tdr_nom_original,
                taches=taches_read,
                created_at=a.created_at,
            )
        )
    return out


def _planif_projet_to_read(
    planif: PlanificationProjet,
    projet: Projet,
    direction: Direction,
) -> PlanificationProjetRead:
    return PlanificationProjetRead(
        id=planif.id,
        projet_id=projet.id,
        projet_code=projet.code,
        projet_description=projet.description,
        type_budget=TypeBudgetProjet(planif.type_budget),
        montant=planif.montant,
        lieu=planif.lieu,
        date_debut=planif.date_debut,
        date_fin=planif.date_fin,
        direction_id=direction.id,
        direction_code=direction.code,
        direction_libelle=direction.libelle,
        email_responsable=planif.email_responsable,
        email_ministre=planif.email_ministre,
        composantes=[
            PlanificationProjetComposanteRead(
                id=c.id,
                ordre=c.ordre,
                libelle=c.libelle,
                activites=[
                    PlanificationProjetActiviteRead(
                        id=a.id,
                        ordre=a.ordre,
                        titre=a.titre,
                        terminee=a.terminee,
                        rapport_nom_original=a.rapport_nom_original,
                    )
                    for a in c.activites
                ],
            )
            for c in planif.composantes
        ],
        created_at=planif.created_at,
    )


def _validate_projet_planification(data: PlanificationProjetCreate) -> None:
    if len(data.composantes) > 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 2 composantes par planification",
        )
    for comp in data.composantes:
        if len(comp.activites) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 activités par composante",
            )


async def create_planification_projet(
    db: AsyncSession,
    data: PlanificationProjetCreate,
) -> PlanificationProjetRead:
    _validate_projet_planification(data)

    projet = await db.get(Projet, data.projet_id)
    if projet is None:
        raise HTTPException(status_code=404, detail="Projet introuvable")

    direction = await db.get(Direction, data.direction_id)
    if direction is None:
        raise HTTPException(status_code=404, detail="Direction introuvable")

    planif = PlanificationProjet(
        projet_id=data.projet_id,
        type_budget=data.type_budget.value,
        montant=data.montant,
        lieu=data.lieu.strip(),
        date_debut=data.date_debut,
        date_fin=data.date_fin,
        direction_id=data.direction_id,
        email_responsable=data.email_responsable.strip(),
        email_ministre=data.email_ministre.strip(),
    )
    db.add(planif)
    await db.flush()

    for idx, comp_data in enumerate(data.composantes, start=1):
        libelle = (comp_data.libelle or "").strip() or None
        composante = PlanificationProjetComposante(
            planification_id=planif.id,
            ordre=idx,
            libelle=libelle,
        )
        db.add(composante)
        await db.flush()
        for act_idx, act in enumerate(comp_data.activites, start=1):
            db.add(
                PlanificationProjetActivite(
                    composante_id=composante.id,
                    ordre=act_idx,
                    titre=act.titre.strip(),
                )
            )

    await db.commit()

    loaded = await db.execute(
        select(PlanificationProjet)
        .where(PlanificationProjet.id == planif.id)
        .options(
            selectinload(PlanificationProjet.composantes).selectinload(
                PlanificationProjetComposante.activites
            ),
        )
    )
    planif_loaded = loaded.scalar_one()
    return _planif_projet_to_read(planif_loaded, projet, direction)


async def update_planification_projet(
    db: AsyncSession,
    planif_id: int,
    data: PlanificationProjetUpdate,
) -> PlanificationProjetRead:
    _validate_projet_planification(data)

    result = await db.execute(
        select(PlanificationProjet)
        .where(PlanificationProjet.id == planif_id)
        .options(
            selectinload(PlanificationProjet.composantes).selectinload(
                PlanificationProjetComposante.activites
            ),
        )
    )
    planif = result.scalar_one_or_none()
    if planif is None:
        raise HTTPException(status_code=404, detail="Planification projet introuvable")

    projet = await db.get(Projet, data.projet_id)
    if projet is None:
        raise HTTPException(status_code=404, detail="Projet introuvable")

    direction = await db.get(Direction, data.direction_id)
    if direction is None:
        raise HTTPException(status_code=404, detail="Direction introuvable")

    planif.projet_id = data.projet_id
    planif.type_budget = data.type_budget.value
    planif.montant = data.montant
    planif.lieu = data.lieu.strip()
    planif.date_debut = data.date_debut
    planif.date_fin = data.date_fin
    planif.direction_id = data.direction_id
    planif.email_responsable = data.email_responsable.strip()
    planif.email_ministre = data.email_ministre.strip()

    kept_comp_ids = {c.id for c in data.composantes if c.id is not None}
    for composante in list(planif.composantes):
        if composante.id not in kept_comp_ids:
            if any(a.terminee for a in composante.activites):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Impossible de supprimer une composante contenant "
                        "une activité déjà terminée au suivi"
                    ),
                )
            await db.delete(composante)

    await db.flush()
    comp_by_id = {c.id: c for c in planif.composantes}

    for idx, comp_data in enumerate(data.composantes, start=1):
        libelle = (comp_data.libelle or "").strip() or None
        if comp_data.id is not None:
            composante = comp_by_id.get(comp_data.id)
            if composante is None or composante.planification_id != planif.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Composante invalide pour cette planification",
                )
            composante.ordre = idx
            composante.libelle = libelle
        else:
            composante = PlanificationProjetComposante(
                planification_id=planif.id,
                ordre=idx,
                libelle=libelle,
            )
            db.add(composante)
            await db.flush()
            comp_by_id[composante.id] = composante

        kept_act_ids = {a.id for a in comp_data.activites if a.id is not None}
        comp_insp = sa_inspect(composante)
        if "activites" in comp_insp.unloaded:
            activites_loaded: list = []
        else:
            activites_loaded = list(composante.activites)
        act_by_id = {a.id: a for a in activites_loaded}
        for activite in activites_loaded:
            if activite.id not in kept_act_ids:
                if activite.terminee:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Impossible de supprimer une activité déjà terminée au suivi",
                    )
                await db.delete(activite)

        for act_idx, act_data in enumerate(comp_data.activites, start=1):
            titre = act_data.titre.strip()
            if act_data.id is not None:
                activite = act_by_id.get(act_data.id)
                if activite is None or activite.composante_id != composante.id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Activité invalide pour cette composante",
                    )
                activite.titre = titre
                activite.ordre = act_idx
            else:
                db.add(
                    PlanificationProjetActivite(
                        composante_id=composante.id,
                        ordre=act_idx,
                        titre=titre,
                    )
                )

    await db.commit()

    loaded = await db.execute(
        select(PlanificationProjet)
        .where(PlanificationProjet.id == planif.id)
        .options(
            selectinload(PlanificationProjet.composantes).selectinload(
                PlanificationProjetComposante.activites
            ),
        )
    )
    planif_loaded = loaded.scalar_one()
    return _planif_projet_to_read(planif_loaded, projet, direction)


async def list_planifications_projet(
    db: AsyncSession,
) -> list[PlanificationProjetRead]:
    result = await db.execute(
        select(PlanificationProjet)
        .options(
            selectinload(PlanificationProjet.composantes).selectinload(
                PlanificationProjetComposante.activites
            ),
        )
        .order_by(PlanificationProjet.created_at.desc())
    )
    planifs = result.scalars().all()
    if not planifs:
        return []

    projet_ids = {p.projet_id for p in planifs}
    direction_ids = {p.direction_id for p in planifs}

    projets_result = await db.execute(
        select(Projet).where(Projet.id.in_(projet_ids))
    )
    projets_map = {p.id: p for p in projets_result.scalars().all()}

    dirs_result = await db.execute(
        select(Direction).where(Direction.id.in_(direction_ids))
    )
    dirs_map = {d.id: d for d in dirs_result.scalars().all()}

    out: list[PlanificationProjetRead] = []
    for planif in planifs:
        projet = projets_map.get(planif.projet_id)
        direction = dirs_map.get(planif.direction_id)
        if projet is None or direction is None:
            continue
        out.append(_planif_projet_to_read(planif, projet, direction))
    return out


async def toggle_projet_activite(
    db: AsyncSession,
    activite_id: int,
    rapport_file: UploadFile | None = None,
) -> dict:
    activite = await db.get(PlanificationProjetActivite, activite_id)
    if activite is None:
        raise HTTPException(status_code=404, detail="Activité projet introuvable")

    activite.terminee = not activite.terminee

    if rapport_file is not None and rapport_file.filename:
        chemin, nom, _ = await storage_service.save_upload(rapport_file, "rapports")
        activite.rapport_chemin = chemin
        activite.rapport_nom_original = nom

    await db.commit()
    await db.refresh(activite)
    return {
        "id": activite.id,
        "terminee": activite.terminee,
        "rapport_nom_original": activite.rapport_nom_original,
    }
