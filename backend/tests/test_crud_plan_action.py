import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_objectif_update_and_delete(client: AsyncClient, auth_headers: dict[str, str]):
    create = await client.post(
        "/api/v1/objectifs",
        headers=auth_headers,
        json={"code": "OC-DEL", "description": "À supprimer"},
    )
    assert create.status_code == 201
    objectif_id = create.json()["id"]

    update = await client.put(
        f"/api/v1/objectifs/{objectif_id}",
        headers=auth_headers,
        json={"description": "Description mise à jour"},
    )
    assert update.status_code == 200
    assert update.json()["description"] == "Description mise à jour"

    delete = await client.delete(f"/api/v1/objectifs/{objectif_id}", headers=auth_headers)
    assert delete.status_code == 204

    get = await client.get(f"/api/v1/objectifs/{objectif_id}", headers=auth_headers)
    assert get.status_code == 404


@pytest.mark.asyncio
async def test_tache_plan_update_and_delete(client: AsyncClient, auth_headers: dict[str, str]):
    create = await client.post(
        "/api/v1/taches-plan",
        headers=auth_headers,
        json={"code": "TP-DEL", "description": "Tâche à supprimer"},
    )
    assert create.status_code == 201
    tache_id = create.json()["id"]

    update = await client.put(
        f"/api/v1/taches-plan/{tache_id}",
        headers=auth_headers,
        json={"description": "Tâche modifiée"},
    )
    assert update.status_code == 200
    assert update.json()["description"] == "Tâche modifiée"

    delete = await client.delete(f"/api/v1/taches-plan/{tache_id}", headers=auth_headers)
    assert delete.status_code == 204


@pytest.mark.asyncio
async def test_activite_crud(client: AsyncClient, auth_headers: dict[str, str]):
    objectif = await client.post(
        "/api/v1/objectifs",
        headers=auth_headers,
        json={"code": "OC-ACT", "description": "Pour activité"},
    )
    objectif_id = objectif.json()["id"]

    activite = await client.post(
        f"/api/v1/objectifs/{objectif_id}/activites",
        headers=auth_headers,
        json={
            "code": "ACT1",
            "description": "Activité CRUD",
            "budget": 100,
            "direction_ids": [],
            "trimestres": [],
        },
    )
    assert activite.status_code == 201
    activite_id = activite.json()["id"]

    update = await client.put(
        f"/api/v1/activites/{activite_id}",
        headers=auth_headers,
        json={"description": "Activité modifiée"},
    )
    assert update.status_code == 200
    assert update.json()["description"] == "Activité modifiée"

    delete = await client.delete(f"/api/v1/activites/{activite_id}", headers=auth_headers)
    assert delete.status_code == 204
