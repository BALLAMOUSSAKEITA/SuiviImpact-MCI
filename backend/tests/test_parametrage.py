import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_ministre_creates_default_row(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.get("/api/v1/parametrage/ministre", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "prenom" in data
    assert "nom" in data


@pytest.mark.asyncio
async def test_update_ministre(client: AsyncClient, auth_headers: dict[str, str]):
    update = await client.put(
        "/api/v1/parametrage/ministre",
        headers=auth_headers,
        json={
            "prenom": "Jean",
            "nom": "Dupont",
            "email": "ministre@mipme.gov.gn",
        },
    )
    assert update.status_code == 200
    assert update.json()["prenom"] == "Jean"
    assert update.json()["nom"] == "Dupont"

    get = await client.get("/api/v1/parametrage/ministre", headers=auth_headers)
    assert get.status_code == 200
    assert get.json()["email"] == "ministre@mipme.gov.gn"


@pytest.mark.asyncio
async def test_update_ministre_validation(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.put(
        "/api/v1/parametrage/ministre",
        headers=auth_headers,
        json={"prenom": "", "nom": "X", "email": "bad"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_sg_creates_default_row(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.get("/api/v1/parametrage/sg", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "prenom" in data
    assert "nom" in data
    assert "email" in data
    assert "email_2" in data


@pytest.mark.asyncio
async def test_update_sg(client: AsyncClient, auth_headers: dict[str, str]):
    update = await client.put(
        "/api/v1/parametrage/sg",
        headers=auth_headers,
        json={
            "prenom": "Awa",
            "nom": "Camara",
            "email": "sg1@mic.gov.gn",
            "email_2": "sg2@mic.gov.gn",
        },
    )
    assert update.status_code == 200
    assert update.json()["prenom"] == "Awa"
    assert update.json()["email"] == "sg1@mic.gov.gn"
    assert update.json()["email_2"] == "sg2@mic.gov.gn"

    get = await client.get("/api/v1/parametrage/sg", headers=auth_headers)
    assert get.status_code == 200
    assert get.json()["email_2"] == "sg2@mic.gov.gn"
