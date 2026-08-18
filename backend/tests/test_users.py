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
async def test_admin_create_membre_bsd_with_tabs(
    client: AsyncClient, admin_headers: dict[str, str]
):
    create = await client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "username": "membre_bsd_1",
            "prenom": "Awa",
            "nom": "Camara",
            "type_acces": "ecriture",
            "role": "membre_bsd",
            "allowed_tabs": ["presence", "suivi", "presence"],
        },
    )
    assert create.status_code == 201
    body = create.json()["user"]
    assert body["role"] == "membre_bsd"
    assert body["allowed_tabs"] == ["suivi", "presence"]
    assert body["type_acces"] == "ecriture"

    detail = await client.get(f"/api/v1/users/{body['id']}", headers=admin_headers)
    assert detail.status_code == 200
    assert detail.json()["allowed_tabs"] == ["suivi", "presence"]

    update = await client.patch(
        f"/api/v1/users/{body['id']}",
        headers=admin_headers,
        json={"allowed_tabs": ["archive"], "type_acces": "lecture"},
    )
    assert update.status_code == 200
    assert update.json()["allowed_tabs"] == ["archive"]
    assert update.json()["type_acces"] == "lecture"


@pytest.mark.asyncio
async def test_admin_cannot_create_membre_bsd_without_tabs(
    client: AsyncClient, admin_headers: dict[str, str]
):
    create = await client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "username": "membre_bsd_vide",
            "prenom": "Sans",
            "nom": "Onglet",
            "type_acces": "lecture",
            "role": "membre_bsd",
            "allowed_tabs": [],
        },
    )
    assert create.status_code == 400
    assert "onglet" in create.json()["detail"].lower()


@pytest.mark.asyncio
async def test_admin_cannot_create_membre_bsd_with_unknown_tab(
    client: AsyncClient, admin_headers: dict[str, str]
):
    create = await client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "username": "membre_bsd_bad",
            "prenom": "Mauvais",
            "nom": "Onglet",
            "type_acces": "lecture",
            "role": "membre_bsd",
            "allowed_tabs": ["presence", "notifications"],
        },
    )
    assert create.status_code == 400
    assert "inconnus" in create.json()["detail"].lower()


@pytest.mark.asyncio
async def test_other_roles_ignore_allowed_tabs(
    client: AsyncClient, admin_headers: dict[str, str]
):
    create = await client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "username": "dir_tabs",
            "prenom": "Dir",
            "nom": "Tabs",
            "type_acces": "lecture",
            "role": "directeur",
            "allowed_tabs": ["presence"],
        },
    )
    assert create.status_code == 201
    assert create.json()["user"]["allowed_tabs"] == []


@pytest.mark.asyncio
async def test_non_admin_cannot_list_users(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.get("/api/v1/users", headers=auth_headers)
    assert response.status_code == 403
