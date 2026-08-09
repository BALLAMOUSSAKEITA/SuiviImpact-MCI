import pytest
from httpx import AsyncClient


async def _create_projet_with_execution(
    client: AsyncClient,
    headers: dict[str, str],
    *,
    code: str,
    type_projet: str,
    execution_financiere: float,
    execution_physique: float,
) -> int:
    create = await client.post(
        "/api/v1/projets",
        headers=headers,
        json={"code": code, "description": f"Projet {code}", "type_projet": type_projet},
    )
    assert create.status_code == 201, create.text
    projet_id = create.json()["id"]

    update = await client.put(
        f"/api/v1/projets/{projet_id}",
        headers=headers,
        json={
            "date_debut": "2026-03-01",
            "execution_financiere": execution_financiere,
            "execution_physique": execution_physique,
        },
    )
    assert update.status_code == 200, update.text
    return projet_id


@pytest.mark.asyncio
async def test_stats_projets_filter_by_type_and_id(
    client: AsyncClient, auth_headers: dict[str, str]
):
    ordinaire_id = await _create_projet_with_execution(
        client,
        auth_headers,
        code="PRJ-ORD",
        type_projet="ordinaire",
        execution_financiere=40,
        execution_physique=30,
    )
    await _create_projet_with_execution(
        client,
        auth_headers,
        code="PRJ-SIM",
        type_projet="mega_simandou",
        execution_financiere=80,
        execution_physique=70,
    )

    all_stats = await client.get(
        "/api/v1/stats/projets?mode=annee&annee=2026",
        headers=auth_headers,
    )
    assert all_stats.status_code == 200
    assert all_stats.json()["total"] >= 2

    ordinaire_stats = await client.get(
        "/api/v1/stats/projets?mode=annee&annee=2026&type_projet=ordinaire",
        headers=auth_headers,
    )
    assert ordinaire_stats.status_code == 200
    body_ord = ordinaire_stats.json()
    assert body_ord["total"] >= 1
    assert float(body_ord["execution_financiere"]) == 40.0
    assert float(body_ord["execution_physique"]) == 30.0

    simandou_stats = await client.get(
        "/api/v1/stats/projets?mode=annee&annee=2026&type_projet=mega_simandou",
        headers=auth_headers,
    )
    assert simandou_stats.status_code == 200
    body_sim = simandou_stats.json()
    assert float(body_sim["execution_financiere"]) == 80.0
    assert float(body_sim["execution_physique"]) == 70.0

    single = await client.get(
        f"/api/v1/stats/projets?mode=annee&annee=2026&projet_id={ordinaire_id}",
        headers=auth_headers,
    )
    assert single.status_code == 200
    body_single = single.json()
    assert body_single["total"] == 1
    assert float(body_single["execution_financiere"]) == 40.0
    assert float(body_single["execution_physique"]) == 30.0
