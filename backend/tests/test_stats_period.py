import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_stats_activites_plage_matches_annee(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    from tests.helpers import (
        create_direction,
        create_objectif,
        create_tache_plan,
        pao_payload,
        post_pao,
    )

    direction_id = await create_direction(client, auth_headers)
    objectif_id = await create_objectif(client, auth_headers, "OC-STP")
    tache_plan_id = await create_tache_plan(client, auth_headers, "TP-STP")
    create = await post_pao(
        client,
        auth_headers,
        pao_payload(
            objectif_id=objectif_id,
            direction_id=direction_id,
            tache_plan_id=tache_plan_id,
        ),
    )
    assert create.status_code == 201

    annee = await client.get(
        "/api/v1/stats/activites?mode=annee&annee=2026",
        headers=auth_headers,
    )
    assert annee.status_code == 200
    plage = await client.get(
        "/api/v1/stats/activites?mode=plage&du=2026-01-01&au=2026-12-31",
        headers=auth_headers,
    )
    assert plage.status_code == 200, plage.text
    assert plage.json()["total"] == annee.json()["total"]
    assert plage.json()["total"] >= 1

    mois = await client.get(
        "/api/v1/stats/activites?mode=mois&mois=2026-01",
        headers=auth_headers,
    )
    assert mois.status_code == 200
    assert mois.json()["total"] >= 1


@pytest.mark.asyncio
async def test_stats_plage_requires_du_au(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.get(
        "/api/v1/stats/activites?mode=plage",
        headers=auth_headers,
    )
    assert response.status_code == 400
