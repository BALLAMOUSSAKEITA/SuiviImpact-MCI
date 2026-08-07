import json

import pytest
from httpx import AsyncClient

from tests.helpers import (
    create_direction,
    create_objectif,
    create_projet_parametrage,
    create_tache_plan,
    pao_payload,
    planif_projet_payload,
    post_pao,
)


@pytest.mark.asyncio
async def test_create_list_update_pao(client: AsyncClient, auth_headers: dict[str, str]):
    direction_id = await create_direction(client, auth_headers)
    objectif_id = await create_objectif(client, auth_headers, "OC-PAO")
    tache_plan_id = await create_tache_plan(client, auth_headers, "TP-PAO")

    payload = pao_payload(
        objectif_id=objectif_id,
        direction_id=direction_id,
        tache_plan_id=tache_plan_id,
    )
    create = await post_pao(client, auth_headers, payload, tdr_bytes=b"%PDF-1.4 test")
    assert create.status_code == 201, create.text
    body = create.json()
    activite_id = body["id"]
    assert body["tdr_nom_original"] == "tdr-test.pdf"
    assert len(body["taches"]) == 1

    listing = await client.get("/api/v1/planification/pao", headers=auth_headers)
    assert listing.status_code == 200
    assert any(a["id"] == activite_id for a in listing.json())

    payload["description"] = "PAO modifiée"
    update = await client.put(
        f"/api/v1/planification/pao/{activite_id}",
        headers=auth_headers,
        data={"payload": json.dumps(payload)},
    )
    assert update.status_code == 200
    assert update.json()["description"] == "PAO modifiée"

    tdr = await client.get(
        f"/api/v1/planification/pao/{activite_id}/tdr",
        headers=auth_headers,
    )
    assert tdr.status_code == 200


@pytest.mark.asyncio
async def test_pao_invalid_ponderation(client: AsyncClient, auth_headers: dict[str, str]):
    direction_id = await create_direction(client, auth_headers)
    objectif_id = await create_objectif(client, auth_headers, "OC-PAO2")
    tache_plan_id = await create_tache_plan(client, auth_headers, "TP-PAO2")

    payload = pao_payload(
        objectif_id=objectif_id,
        direction_id=direction_id,
        tache_plan_id=tache_plan_id,
    )
    payload["taches"] = [{"tache_plan_id": tache_plan_id, "ponderation": 10}]
    response = await post_pao(client, auth_headers, payload)
    assert response.status_code == 400
    assert "Pondération" in response.json()["detail"]


@pytest.mark.asyncio
async def test_planification_projet_crud_and_toggle(
    client: AsyncClient, auth_headers: dict[str, str]
):
    direction_id = await create_direction(client, auth_headers)
    projet_id = await create_projet_parametrage(client, auth_headers)

    payload = planif_projet_payload(projet_id=projet_id, direction_id=direction_id)
    create = await client.post(
        "/api/v1/planification/projet",
        headers=auth_headers,
        json=payload,
    )
    assert create.status_code == 201, create.text
    planif = create.json()
    planif_id = planif["id"]
    comp = planif["composantes"][0]
    activite_id = comp["activites"][0]["id"]

    payload = planif_projet_payload(projet_id=projet_id, direction_id=direction_id)
    payload["composantes"] = [
        {
            "id": comp["id"],
            "libelle": comp["libelle"],
            "activites": [{"id": activite_id, "titre": "Activité projet A"}],
        }
    ]
    payload["lieu"] = "Kindia"
    update = await client.put(
        f"/api/v1/planification/projet/{planif_id}",
        headers=auth_headers,
        json=payload,
    )
    assert update.status_code == 200
    assert update.json()["lieu"] == "Kindia"

    listing = await client.get("/api/v1/planification/projet", headers=auth_headers)
    assert any(p["id"] == planif_id for p in listing.json())

    toggle = await client.post(
        f"/api/v1/suivi/projet/activite/{activite_id}/toggle",
        headers=auth_headers,
    )
    assert toggle.status_code == 200
    assert toggle.json()["terminee"] is True

    toggle2 = await client.post(
        f"/api/v1/suivi/projet/activite/{activite_id}/toggle",
        headers=auth_headers,
    )
    assert toggle2.json()["terminee"] is False
