import pytest
from httpx import AsyncClient

RCC_BASE = {
    "trimestre": 1,
    "annee": 2026,
    "date_recommandation": "2026-02-10",
    "description": "Recommandation test",
    "responsable": "M. RCC",
    "execution": 0,
}


@pytest.mark.asyncio
async def test_recommandations_crud_and_finaliser(
    client: AsyncClient, auth_headers: dict[str, str]
):
    create = await client.post(
        "/api/v1/recommandations",
        headers=auth_headers,
        json=RCC_BASE,
    )
    assert create.status_code == 201
    item_id = create.json()["id"]

    listing = await client.get(
        "/api/v1/recommandations?trimestre=1&annee=2026",
        headers=auth_headers,
    )
    assert listing.status_code == 200
    assert any(i["id"] == item_id for i in listing.json()["items"])

    update = await client.put(
        f"/api/v1/recommandations/{item_id}",
        headers=auth_headers,
        json={"description": "RCC modifiée"},
    )
    assert update.status_code == 200

    finaliser = await client.patch(
        f"/api/v1/recommandations/{item_id}/finaliser",
        headers=auth_headers,
    )
    assert finaliser.status_code == 200
    assert float(finaliser.json()["execution"]) == 100.0

    delete = await client.delete(f"/api/v1/recommandations/{item_id}", headers=auth_headers)
    assert delete.status_code == 204


@pytest.mark.asyncio
async def test_missions_crud_and_finaliser(client: AsyncClient, auth_headers: dict[str, str]):
    payload = {
        "trimestre": 2,
        "annee": 2026,
        "date_mission": "2026-05-01",
        "description": "Mission test",
        "responsable": "M. Mission",
        "execution": 25,
    }
    create = await client.post("/api/v1/missions", headers=auth_headers, json=payload)
    assert create.status_code == 201
    item_id = create.json()["id"]

    get = await client.get(f"/api/v1/missions/{item_id}", headers=auth_headers)
    assert get.status_code == 200

    finaliser = await client.patch(
        f"/api/v1/missions/{item_id}/finaliser",
        headers=auth_headers,
    )
    assert finaliser.status_code == 200
    assert float(finaliser.json()["execution"]) == 100.0

    delete = await client.delete(f"/api/v1/missions/{item_id}", headers=auth_headers)
    assert delete.status_code == 204


@pytest.mark.asyncio
async def test_ppm_crud(client: AsyncClient, auth_headers: dict[str, str]):
    create = await client.post(
        "/api/v1/ppm",
        headers=auth_headers,
        json={
            "intitule": "Marché test PPM",
            "statut": "dao_elabore",
            "montant_estime": 150000,
        },
    )
    assert create.status_code == 201
    item_id = create.json()["id"]

    update = await client.put(
        f"/api/v1/ppm/{item_id}",
        headers=auth_headers,
        json={"intitule": "Marché modifié", "statut": "dao_publie"},
    )
    assert update.status_code == 200

    listing = await client.get("/api/v1/ppm", headers=auth_headers)
    assert any(p["id"] == item_id for p in listing.json())

    delete = await client.delete(f"/api/v1/ppm/{item_id}", headers=auth_headers)
    assert delete.status_code == 204


@pytest.mark.asyncio
async def test_indicateurs_crud(client: AsyncClient, auth_headers: dict[str, str]):
    create = await client.post(
        "/api/v1/indicateurs",
        headers=auth_headers,
        json={
            "code": "IND1",
            "libelle": "Indicateur test",
            "cible": 100,
            "realise": 10,
        },
    )
    assert create.status_code == 201
    item_id = create.json()["id"]

    update = await client.put(
        f"/api/v1/indicateurs/{item_id}",
        headers=auth_headers,
        json={"realise": 50},
    )
    assert update.status_code == 200
    assert float(update.json()["realise"]) == 50.0

    delete = await client.delete(f"/api/v1/indicateurs/{item_id}", headers=auth_headers)
    assert delete.status_code == 204


@pytest.mark.asyncio
async def test_projets_parametrage_crud(client: AsyncClient, auth_headers: dict[str, str]):
    create = await client.post(
        "/api/v1/projets",
        headers=auth_headers,
        json={"description": "Projet CRUD test"},
    )
    assert create.status_code == 201
    item_id = create.json()["id"]
    assert create.json()["code"]

    update = await client.put(
        f"/api/v1/projets/{item_id}",
        headers=auth_headers,
        json={"description": "Projet renommé", "cout": 1000000},
    )
    assert update.status_code == 200

    delete = await client.delete(f"/api/v1/projets/{item_id}", headers=auth_headers)
    assert delete.status_code == 204
