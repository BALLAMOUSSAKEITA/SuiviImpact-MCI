#!/usr/bin/env python3
"""Vérifie l'intégrité des fichiers stockés (chemins en base vs disque).

Usage (depuis la racine du dépôt) :
  python scripts/check_storage_integrity.py
  python scripts/check_storage_integrity.py --upload-dir ./backend/uploads
  python scripts/check_storage_integrity.py --strict   # code de sortie 1 si manquant

Prérequis : variables d'environnement / .env backend (DATABASE_URL, UPLOAD_DIR).
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.models.archive import FichierArchive
from app.models.plan_action import Activite
from app.models.planification_projet import PlanificationProjetActivite
from app.models.tache import Tache, TacheFichier
from app.models.workflow import WorkflowAction


@dataclass
class MissingEntry:
    table: str
    row_id: int
    label: str
    chemin: str


def file_exists(upload_root: Path, relative_path: str) -> bool:
    normalized = relative_path.replace("\\", "/")
    full = (upload_root / normalized).resolve()
    try:
        full.relative_to(upload_root.resolve())
    except ValueError:
        return False
    return full.is_file()


async def collect_missing(upload_root: Path) -> list[MissingEntry]:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    missing: list[MissingEntry] = []

    async with session_maker() as db:
        archive_rows = await db.execute(select(FichierArchive))
        for row in archive_rows.scalars():
            if not file_exists(upload_root, row.chemin_stockage):
                missing.append(
                    MissingEntry(
                        "fichiers_archive",
                        row.id,
                        row.nom,
                        row.chemin_stockage,
                    )
                )

        tache_fichier_rows = await db.execute(select(TacheFichier))
        for row in tache_fichier_rows.scalars():
            if not file_exists(upload_root, row.chemin_stockage):
                missing.append(
                    MissingEntry(
                        "tache_fichiers",
                        row.id,
                        f"tache_fichier#{row.id}",
                        row.chemin_stockage,
                    )
                )

        activite_rows = await db.execute(
            select(Activite).where(Activite.tdr_chemin.is_not(None))
        )
        for row in activite_rows.scalars():
            assert row.tdr_chemin is not None
            if not file_exists(upload_root, row.tdr_chemin):
                missing.append(
                    MissingEntry(
                        "activites",
                        row.id,
                        row.tdr_nom_original or row.code,
                        row.tdr_chemin,
                    )
                )

        rapport_rows = await db.execute(
            select(PlanificationProjetActivite).where(
                PlanificationProjetActivite.rapport_chemin.is_not(None)
            )
        )
        for row in rapport_rows.scalars():
            assert row.rapport_chemin is not None
            if not file_exists(upload_root, row.rapport_chemin):
                missing.append(
                    MissingEntry(
                        "planification_projet_activites",
                        row.id,
                        f"activite_projet#{row.id}",
                        row.rapport_chemin,
                    )
                )

        tache_rows = await db.execute(select(Tache).where(Tache.fichier_path.is_not(None)))
        for row in tache_rows.scalars():
            assert row.fichier_path is not None
            if not file_exists(upload_root, row.fichier_path):
                missing.append(
                    MissingEntry(
                        "taches",
                        row.id,
                        (row.description[:60] + "…") if len(row.description) > 60 else row.description,
                        row.fichier_path,
                    )
                )

        workflow_rows = await db.execute(
            select(WorkflowAction).where(WorkflowAction.file_path.is_not(None))
        )
        for row in workflow_rows.scalars():
            assert row.file_path is not None
            label = row.file_name or f"workflow_action#{row.id}"
            if not file_exists(upload_root, row.file_path):
                missing.append(
                    MissingEntry(
                        "workflow_actions",
                        row.id,
                        label,
                        row.file_path,
                    )
                )

    await engine.dispose()
    return missing


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Vérifie que les chemins de fichiers en base existent sous UPLOAD_DIR."
    )
    parser.add_argument(
        "--upload-dir",
        default=settings.UPLOAD_DIR,
        help=f"Répertoire des uploads (défaut: {settings.UPLOAD_DIR})",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Code de sortie 1 si au moins un fichier est manquant",
    )
    args = parser.parse_args()

    upload_root = Path(args.upload_dir).resolve()
    if not upload_root.is_dir():
        print(f"Erreur : répertoire uploads introuvable — {upload_root}", file=sys.stderr)
        return 2

    print(f"Vérification intégrité stockage")
    print(f"  Base     : {settings.DATABASE_URL.split('@')[-1]}")
    print(f"  Uploads  : {upload_root}")
    print()

    missing = asyncio.run(collect_missing(upload_root))

    if not missing:
        print("OK — tous les chemins en base pointent vers un fichier existant.")
        return 0

    by_table: dict[str, list[MissingEntry]] = {}
    for entry in missing:
        by_table.setdefault(entry.table, []).append(entry)

    print(f"ATTENTION — {len(missing)} entrée(s) orpheline(s) (fichier absent du disque) :\n")
    for table, entries in sorted(by_table.items()):
        print(f"  [{table}] {len(entries)} manquant(s)")
        for e in entries[:20]:
            print(f"    - id={e.row_id} | {e.label} | {e.chemin}")
        if len(entries) > 20:
            print(f"    … et {len(entries) - 20} autre(s)")
        print()

    print(
        "Ces entrées peuvent subsister après une migration de données. "
        "Les téléchargements échoueront tant que le fichier n'est pas restauré "
        "ou l'entrée supprimée."
    )
    return 1 if args.strict else 0


if __name__ == "__main__":
    raise SystemExit(main())
