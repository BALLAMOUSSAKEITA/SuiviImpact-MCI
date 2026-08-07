"""Données de test réutilisables pour les tests API."""

from __future__ import annotations

import json
from typing import Any

from httpx import AsyncClient


async def create_direction(client: AsyncClient, headers: dict[str, str]) -> int:
    response = await client.post(
        "/api/v1/directions",
        headers=headers,
        json={
            "libelle": "Direction Test API",
            "directeur_nom": "Directeur Test",
            "email_directeur": "dir.test@mipme.gov.gn",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def create_objectif(client: AsyncClient, headers: dict[str, str], code: str = "OC-API") -> int:
    response = await client.post(
        "/api/v1/objectifs",
        headers=headers,
        json={"code": code, "description": "Objectif pour tests API"},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def create_tache_plan(client: AsyncClient, headers: dict[str, str], code: str = "TP-API") -> int:
    response = await client.post(
        "/api/v1/taches-plan",
        headers=headers,
        json={"code": code, "description": "Tâche plan pour PAO"},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


async def create_projet_parametrage(client: AsyncClient, headers: dict[str, str]) -> int:
    response = await client.post(
        "/api/v1/projets",
        headers=headers,
        json={"description": "Projet paramétrage test"},
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def pao_payload(
    *,
    objectif_id: int,
    direction_id: int,
    tache_plan_id: int | None = None,
    description: str = "Activité PAO test",
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "description": description,
        "objectif_id": objectif_id,
        "budget": 1000,
        "date_debut": "2025-01-15",
        "date_fin": "2025-06-30",
        "direction_id": direction_id,
        "email_responsable": "resp@mipme.gov.gn",
        "email_ministre": "ministre@mipme.gov.gn",
        "taches": [],
    }
    if tache_plan_id is not None:
        body["taches"] = [{"tache_plan_id": tache_plan_id, "ponderation": 25}]
    return body


async def post_pao(
    client: AsyncClient,
    headers: dict[str, str],
    payload: dict[str, Any],
    *,
    tdr_bytes: bytes | None = None,
):
    files = {}
    if tdr_bytes is not None:
        files["tdr"] = ("tdr-test.pdf", tdr_bytes, "application/pdf")
    return await client.post(
        "/api/v1/planification/pao",
        headers=headers,
        data={"payload": json.dumps(payload)},
        files=files or None,
    )


def planif_projet_payload(*, projet_id: int, direction_id: int) -> dict[str, Any]:
    return {
        "projet_id": projet_id,
        "type_budget": "BND",
        "composantes": [
            {
                "libelle": "Composante 1",
                "activites": [{"titre": "Activité projet A"}],
            }
        ],
        "montant": 50000,
        "lieu": "Conakry",
        "date_debut": "2025-01-01",
        "date_fin": "2025-12-31",
        "direction_id": direction_id,
        "email_responsable": "resp@mipme.gov.gn",
        "email_ministre": "ministre@mipme.gov.gn",
    }
