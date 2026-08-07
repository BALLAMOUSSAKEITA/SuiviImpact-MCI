from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.modules import Mission, Ppm, Projet, Recommandation
from app.models.plan_action import Activite
from app.models.tache import Tache


def _styled_header(ws, headers: list[str]) -> None:
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill


def _save_workbook(wb: Workbook) -> BytesIO:
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


async def export_activites(db: AsyncSession) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Activités"
    headers = ["Code", "Description", "Budget", "Exécution", "Trimestres planifiés"]
    _styled_header(ws, headers)

    result = await db.execute(
        select(Activite).options(selectinload(Activite.trimestres)).order_by(Activite.code)
    )
    for row_idx, activite in enumerate(result.scalars().all(), start=2):
        trimestres = ", ".join(
            f"T{t.trimestre}/{t.annee}"
            for t in activite.trimestres
            if t.planifie
        )
        ws.cell(row=row_idx, column=1, value=activite.code)
        ws.cell(row=row_idx, column=2, value=activite.description)
        ws.cell(row=row_idx, column=3, value=float(activite.budget))
        ws.cell(row=row_idx, column=4, value=float(activite.execution))
        ws.cell(row=row_idx, column=5, value=trimestres)

    return _save_workbook(wb)


async def export_taches(db: AsyncSession) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Tâches"
    headers = [
        "Activité ID",
        "Trimestre",
        "Année",
        "Description",
        "Responsable",
        "Pondération",
        "Statut",
        "Semaines",
    ]
    _styled_header(ws, headers)

    result = await db.execute(
        select(Tache).options(selectinload(Tache.semaines)).order_by(Tache.id)
    )
    for row_idx, tache in enumerate(result.scalars().all(), start=2):
        semaines = ", ".join(f"M{s.mois}S{s.semaine}" for s in tache.semaines)
        ws.cell(row=row_idx, column=1, value=tache.activite_id)
        ws.cell(row=row_idx, column=2, value=tache.trimestre)
        ws.cell(row=row_idx, column=3, value=tache.annee)
        ws.cell(row=row_idx, column=4, value=tache.description)
        ws.cell(row=row_idx, column=5, value=tache.responsable)
        ws.cell(row=row_idx, column=6, value=float(tache.ponderation))
        ws.cell(row=row_idx, column=7, value=tache.statut.value)
        ws.cell(row=row_idx, column=8, value=semaines)

    return _save_workbook(wb)


async def export_recommandations(db: AsyncSession) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Recommandations RCC"
    headers = [
        "Trimestre",
        "Année",
        "Date",
        "Description",
        "Responsable",
        "Exécution",
        "Observations",
    ]
    _styled_header(ws, headers)

    result = await db.execute(select(Recommandation).order_by(Recommandation.id))
    for row_idx, item in enumerate(result.scalars().all(), start=2):
        ws.cell(row=row_idx, column=1, value=item.trimestre)
        ws.cell(row=row_idx, column=2, value=item.annee)
        ws.cell(row=row_idx, column=3, value=item.date_recommandation.isoformat())
        ws.cell(row=row_idx, column=4, value=item.description)
        ws.cell(row=row_idx, column=5, value=item.responsable)
        ws.cell(row=row_idx, column=6, value=float(item.execution))
        ws.cell(row=row_idx, column=7, value=item.observations or "")

    return _save_workbook(wb)


async def export_missions(db: AsyncSession) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Missions"
    headers = [
        "Trimestre",
        "Année",
        "Date",
        "Description",
        "Responsable",
        "Exécution",
        "Observations",
    ]
    _styled_header(ws, headers)

    result = await db.execute(select(Mission).order_by(Mission.id))
    for row_idx, item in enumerate(result.scalars().all(), start=2):
        ws.cell(row=row_idx, column=1, value=item.trimestre)
        ws.cell(row=row_idx, column=2, value=item.annee)
        ws.cell(row=row_idx, column=3, value=item.date_mission.isoformat())
        ws.cell(row=row_idx, column=4, value=item.description)
        ws.cell(row=row_idx, column=5, value=item.responsable)
        ws.cell(row=row_idx, column=6, value=float(item.execution))
        ws.cell(row=row_idx, column=7, value=item.observations or "")

    return _save_workbook(wb)


async def export_ppm(db: AsyncSession) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Marchés PPM"
    headers = [
        "Numéro",
        "Intitulé",
        "Type",
        "Mode passation",
        "Montant estimé",
        "Montant attribué",
        "Financement",
        "Date",
        "Statut",
    ]
    _styled_header(ws, headers)

    result = await db.execute(select(Ppm).order_by(Ppm.id))
    for row_idx, item in enumerate(result.scalars().all(), start=2):
        ws.cell(row=row_idx, column=1, value=item.numero or "")
        ws.cell(row=row_idx, column=2, value=item.intitule)
        ws.cell(row=row_idx, column=3, value=item.type_marche or "")
        ws.cell(row=row_idx, column=4, value=item.mode_passation or "")
        ws.cell(row=row_idx, column=5, value=float(item.montant_estime or 0))
        ws.cell(row=row_idx, column=6, value=float(item.montant_attribue or 0))
        ws.cell(row=row_idx, column=7, value=item.financement or "")
        ws.cell(
            row=row_idx,
            column=8,
            value=item.date_marche.isoformat() if item.date_marche else "",
        )
        ws.cell(row=row_idx, column=9, value=item.statut.value)

    return _save_workbook(wb)


async def export_projets(db: AsyncSession) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Projets"
    headers = [
        "Identifiant",
        "Nom du projet",
        "Abréviation",
        "Coût",
        "Bailleur",
        "Part État",
        "Part Bailleur",
        "Exécution financière",
        "Exécution physique",
        "Date début",
        "Date fin",
    ]
    _styled_header(ws, headers)

    result = await db.execute(select(Projet).order_by(Projet.id))
    for row_idx, item in enumerate(result.scalars().all(), start=2):
        ws.cell(row=row_idx, column=1, value=item.code)
        ws.cell(row=row_idx, column=2, value=item.description)
        ws.cell(row=row_idx, column=3, value=item.abreviation or "")
        ws.cell(row=row_idx, column=4, value=float(item.cout or 0))
        ws.cell(row=row_idx, column=5, value=item.bailleur or "")
        ws.cell(row=row_idx, column=6, value=float(item.part_etat or 0))
        ws.cell(row=row_idx, column=7, value=float(item.part_bailleur or 0))
        ws.cell(row=row_idx, column=8, value=float(item.execution_financiere))
        ws.cell(row=row_idx, column=9, value=float(item.execution_physique))
        ws.cell(
            row=row_idx,
            column=10,
            value=item.date_debut.isoformat() if item.date_debut else "",
        )
        ws.cell(
            row=row_idx,
            column=11,
            value=item.date_fin.isoformat() if item.date_fin else "",
        )

    return _save_workbook(wb)
