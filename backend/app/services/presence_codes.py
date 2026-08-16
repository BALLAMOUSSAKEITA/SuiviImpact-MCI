"""Génération de codes de présence à 4 chiffres."""

from __future__ import annotations

import secrets
from random import Random


def generate_presence_code(existing: set[str]) -> str:
    """Génère un code unique entre 1000 et 9999."""
    for _ in range(2000):
        code = f"{secrets.randbelow(9000) + 1000:04d}"
        if code not in existing:
            return code
    raise RuntimeError("Impossible de générer un code de présence unique")


def generate_unique_codes(count: int, *, seed: int | None = None) -> list[str]:
    """Génère `count` codes uniques (seed optionnel pour données reproductibles)."""
    rng = Random(seed) if seed is not None else None
    codes: set[str] = set()
    result: list[str] = []
    attempts = 0
    max_attempts = count * 200
    while len(result) < count and attempts < max_attempts:
        attempts += 1
        if rng is not None:
            code = f"{rng.randint(1000, 9999):04d}"
        else:
            code = f"{secrets.randbelow(9000) + 1000:04d}"
        if code not in codes:
            codes.add(code)
            result.append(code)
    if len(result) < count:
        raise RuntimeError("Impossible de générer suffisamment de codes uniques")
    return result
