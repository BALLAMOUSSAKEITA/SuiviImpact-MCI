import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_direction_crud(client: AsyncClient, auth_headers: dict[str, str]):
    create = await client.post(
        "/api/v1/directions",
        headers=auth_headers,
        json={
            "libelle": "Direction des Statistiques",
            "directeur_nom": "M. Test",
            "email_directeur": "stats@mipme.gov.gn",
        },
    )
    assert create.status_code == 201
    body = create.json()
    assert body["libelle"] == "Direction des Statistiques"
    assert body["code"]
    direction_id = body["id"]

    listing = await client.get("/api/v1/directions", headers=auth_headers)
    assert listing.status_code == 200
    assert any(d["id"] == direction_id for d in listing.json())

    update = await client.put(
        f"/api/v1/directions/{direction_id}",
        headers=auth_headers,
        json={"directeur_nom": "M. Modifié"},
    )
    assert update.status_code == 200
    assert update.json()["directeur_nom"] == "M. Modifié"

    delete = await client.delete(
        f"/api/v1/directions/{direction_id}",
        headers=auth_headers,
    )
    assert delete.status_code == 204

    missing = await client.put(
        f"/api/v1/directions/{direction_id}",
        headers=auth_headers,
        json={"libelle": "X"},
    )
    assert missing.status_code == 404


@pytest.mark.asyncio
async def test_create_direction_validation(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.post(
        "/api/v1/directions",
        headers=auth_headers,
        json={"libelle": "", "directeur_nom": "X", "email_directeur": "a@b.co"},
    )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)
    assert len(detail) >= 1


@pytest.mark.asyncio
async def test_delete_direction_not_found(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.delete("/api/v1/directions/99999", headers=auth_headers)
    assert response.status_code == 404
