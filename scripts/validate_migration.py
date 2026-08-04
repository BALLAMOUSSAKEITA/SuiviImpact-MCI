#!/usr/bin/env python3
"""Validation post-migration — compare les comptages MySQL vs PostgreSQL."""

from __future__ import annotations

import argparse

TABLES = [
    ("users", "users"),
    ("objectifs", "objectifs"),
    ("activite", "activites"),
    ("taches", "taches"),
    ("recommandations", "recommandations"),
    ("mission", "missions"),
    ("ppm", "ppm"),
    ("projets", "projets"),
    ("indicateurs", "indicateurs"),
    ("dossiers", "dossiers"),
    ("fichiers", "fichiers_archive"),
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mysql-url", required=True)
    parser.add_argument("--pg-url", required=True)
    args = parser.parse_args()

    print("Validation migration — tables à comparer :")
    for mysql, pg in TABLES:
        print(f"  {mysql} → {pg}")

    print("\nConnectez les deux bases et implémentez count(*) pour chaque paire.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
