import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_create_and_manage_user(
    client: AsyncClient, admin_headers: dict[str, str]
):
    listing = await client.get("/api/v1/users", headers=admin_headers)
    assert listing.status_code == 200

    create = await client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "username": "nouveau_user",
            "password": "secret123",
            "prenom": "Nouveau",
            "type_acces": "lecture",
            "role": "directeur",
        },
    )
    assert create.status_code == 201
    user_id = create.json()["user"]["id"]

    duplicate = await client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "username": "nouveau_user",
            "password": "secret123",
            "prenom": "Autre",
            "type_acces": "lecture",
            "role": "directeur",
        },
    )
    assert duplicate.status_code == 400

    deactivate = await client.patch(
        f"/api/v1/users/{user_id}/deactivate",
        headers=admin_headers,
    )
    assert deactivate.status_code == 200
    assert deactivate.json()["etat"] is False

    activate = await client.patch(
        f"/api/v1/users/{user_id}/activate",
        headers=admin_headers,
    )
    assert activate.json()["etat"] is True

    delete = await client.delete(f"/api/v1/users/{user_id}", headers=admin_headers)
    assert delete.status_code == 204


@pytest.mark.asyncio
async def test_non_admin_cannot_list_users(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.get("/api/v1/users", headers=auth_headers)
    assert response.status_code == 403
