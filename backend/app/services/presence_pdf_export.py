"""Export PDF — liste de présence Conseil de Cabinet (format officiel)."""

from __future__ import annotations

from datetime import date, datetime
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.timezone import format_time_guinea
from app.models.presence import PersonnelCabinet

ASSETS_DIR = Path(__file__).resolve().parents[1] / "assets" / "branding"
ARMOIRIES_PATH = ASSETS_DIR / "armoiries-guinee.jpg"

MINISTRY = "MINISTÈRE DE L'INDUSTRIE ET DU COMMERCE"
MOTTO = "Travail - Justice - Solidarité"
BSD = "Bureau de Stratégie et de Développement (BSD)"

MONTHS_FR = (
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
)


def _format_date_fr(value: date) -> str:
    return f"{value.day} {MONTHS_FR[value.month - 1]} {value.year}"


def _format_time(value: datetime) -> str:
    return format_time_guinea(value)


def _display_cell(value: str | None) -> str:
    text = (value or "").strip()
    return text if text else "—"


def _paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    safe = _display_cell(text).replace("&", "&amp;").replace("<", "&lt;")
    return Paragraph(safe, style)


def build_presence_list_pdf(
    *,
    titre: str,
    date_seance: date,
    personnel: list[PersonnelCabinet],
    presence_times: dict[int, datetime],
) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=1.2 * cm,
        rightMargin=1.2 * cm,
        topMargin=1 * cm,
        bottomMargin=1 * cm,
        title=f"Liste de présence — {date_seance.isoformat()}",
    )

    styles = getSampleStyleSheet()
    motto_style = ParagraphStyle(
        "Motto",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#5A6B63"),
    )
    ministry_style = ParagraphStyle(
        "Ministry",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1A3D2E"),
        spaceAfter=4,
    )
    bsd_style = ParagraphStyle(
        "BSD",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#5A6B63"),
        spaceAfter=10,
    )
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#009959"),
        spaceAfter=12,
    )
    cell_style = ParagraphStyle(
        "Cell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9,
        alignment=TA_LEFT,
    )
    cell_center = ParagraphStyle(
        "CellCenter",
        parent=cell_style,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
    )
    section_style = ParagraphStyle(
        "Section",
        parent=cell_style,
        fontName="Helvetica-Bold",
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#007A47"),
    )

    story: list = []

    if ARMOIRIES_PATH.is_file():
        logo = Image(str(ARMOIRIES_PATH), width=1.6 * cm, height=1.6 * cm)
        logo.hAlign = "CENTER"
        story.append(logo)
        story.append(Spacer(1, 0.15 * cm))

    story.append(Paragraph(MOTTO, motto_style))
    story.append(Paragraph(MINISTRY, ministry_style))
    story.append(Paragraph(BSD, bsd_style))
    story.append(
        Paragraph(
            f"{titre} — {_format_date_fr(date_seance)}",
            title_style,
        )
    )

    headers = [
        _paragraph("N°", cell_center),
        _paragraph("PRENOMS ET NOMS", cell_center),
        _paragraph("FONCTIONS", cell_center),
        _paragraph("CONTACTS", cell_center),
        _paragraph("EMAILS", cell_center),
        _paragraph("HEURE D'ENREGISTREMENT", cell_center),
    ]
    table_data: list[list] = [headers]

    current_categorie: str | None = None
    for person in personnel:
        if person.categorie and person.categorie != current_categorie:
            current_categorie = person.categorie
            table_data.append(
                [
                    _paragraph(current_categorie.upper(), section_style),
                    "",
                    "",
                    "",
                    "",
                    "",
                ]
            )

        pointe = presence_times.get(person.id)
        heure_enregistrement = _format_time(pointe) if pointe else ""

        table_data.append(
            [
                _paragraph(str(person.num_ordre), cell_center),
                _paragraph(_display_cell(person.nom_complet), cell_style),
                _paragraph(_display_cell(person.fonction), cell_style),
                _paragraph(_display_cell(person.contact), cell_style),
                _paragraph(_display_cell(person.email), cell_style),
                _paragraph(heure_enregistrement, cell_center),
            ]
        )

    col_widths = [1.2 * cm, 5.3 * cm, 7.1 * cm, 3 * cm, 5.2 * cm, 3.7 * cm]
    table = Table(table_data, colWidths=col_widths, repeatRows=1)

    green = colors.HexColor("#009959")
    green_light = colors.HexColor("#F4FAF7")
    border = colors.HexColor("#D4E8DE")

    style_commands: list = [
        ("BACKGROUND", (0, 0), (-1, 0), green),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]

    row_idx = 1
    zebra = 0
    while row_idx < len(table_data):
        row = table_data[row_idx]
        is_section = len(row) >= 1 and isinstance(row[0], Paragraph) and row[1] == ""
        if is_section:
            style_commands.append(("SPAN", (0, row_idx), (-1, row_idx)))
            style_commands.append(("BACKGROUND", (0, row_idx), (-1, row_idx), green_light))
            style_commands.append(("ALIGN", (0, row_idx), (-1, row_idx), "CENTER"))
        else:
            if zebra % 2 == 1:
                style_commands.append(("BACKGROUND", (0, row_idx), (-1, row_idx), green_light))
            zebra += 1
        row_idx += 1

    table.setStyle(TableStyle(style_commands))
    story.append(table)

    doc.build(story)
    buffer.seek(0)
    return buffer
