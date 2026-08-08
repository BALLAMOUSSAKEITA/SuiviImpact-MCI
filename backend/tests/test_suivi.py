import pytest
from httpx import AsyncClient

from tests.helpers import (
    create_direction,
    create_objectif,
    create_tache_plan,
    pao_payload,
    post_pao,
)


@pytest.mark.asyncio
async def test_suivi_lists_pao_activite(client: AsyncClient, auth_headers: dict[str, str]):
    direction_id = await create_direction(client, auth_headers)
    objectif_id = await create_objectif(client, auth_headers, "OC-SUIVI")
    tache_plan_id = await create_tache_plan(client, auth_headers, "TP-SUIVI")

    payload = pao_payload(
        objectif_id=objectif_id,
        direction_id=direction_id,
        tache_plan_id=tache_plan_id,
    )
    create = await post_pao(client, auth_headers, payload)
    assert create.status_code == 201
    activite_id = create.json()["id"]
    tache_id = None

    taches = await client.get(
        f"/api/v1/suivi/2026/1/activites/{activite_id}/taches",
        headers=auth_headers,
    )
    assert taches.status_code == 200
    assert len(taches.json()) >= 1
    tache_id = taches.json()[0]["id"]

    suivi = await client.get("/api/v1/suivi/2026/1", headers=auth_headers)
    assert suivi.status_code == 200
    codes = [a["code"] for a in suivi.json()]
    assert create.json()["code"] in codes

    details = await client.get(f"/api/v1/taches/{tache_id}/details", headers=auth_headers)
    assert details.status_code == 200

    finaliser = await client.post(
        f"/api/v1/taches/{tache_id}/finaliser",
        headers=auth_headers,
        data={"observation": "Terminé en test"},
    )
    assert finaliser.status_code == 200
    assert finaliser.json()["statut"] == "terminee"
