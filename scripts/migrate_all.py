#!/usr/bin/env python3
"""
Script master de migration MySQL → PostgreSQL.
Usage: python scripts/migrate_all.py --mysql-url ... --pg-url ...

Prérequis: accès à la base MySQL source et PostgreSQL cible.
"""

from __future__ import annotations

import argparse
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="Migration SuiviImpact MySQL → PostgreSQL")
    parser.add_argument("--mysql-url", required=True, help="URL connexion MySQL source")
    parser.add_argument("--dry-run", action="store_true", help="Simulation sans écriture")
    args = parser.parse_args()

    steps = [
        "users",
        "objectifs",
        "activites + pivots trimestres/directions",
        "taches + tache_semaines",
        "recommandations",
        "missions",
        "ppm",
        "projets",
        "indicateurs",
        "dossiers + fichiers_archive",
    ]

    print("Migration SuiviImpact — ordre d'exécution :")
    for i, step in enumerate(steps, 1):
        print(f"  {i}. {step}")

    if args.dry_run:
        print("\n[DRY-RUN] Aucune donnée migrée.")
        return 0

    print(
        "\nImplémentez les connecteurs MySQL pour chaque table "
        "en vous référant à docs/refonte/FONCTIONNALITES.md section 18.",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
