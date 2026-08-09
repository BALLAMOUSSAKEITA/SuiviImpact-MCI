import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import AccessType, User, UserRole


@pytest.fixture
async def developpeur_headers(client: AsyncClient, db_session: AsyncSession) -> dict[str, str]:
    developpeur = User(
        username="dev_test",
        password_hash=hash_password("dev_test123"),
        prenom="Dev",
        nom="Test",
        role=UserRole.DEVELOPPEUR,
        type_acces=AccessType.ECRITURE,
        etat=True,
    )
    db_session.add(developpeur)
    await db_session.commit()

    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "dev_test", "password": "dev_test123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_developpeur_can_access_notifications(
    client: AsyncClient, developpeur_headers: dict[str, str]
):
    response = await client.get(
        "/api/v1/notifications/email-config",
        headers=developpeur_headers,
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_admin_cannot_access_notifications(
    client: AsyncClient, admin_headers: dict[str, str]
):
    response = await client.get(
        "/api/v1/notifications/email-config",
        headers=admin_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_bsd_user_cannot_access_notifications(
    client: AsyncClient, auth_headers: dict[str, str]
):
    response = await client.get(
        "/api/v1/notifications",
        headers=auth_headers,
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_create_developpeur_account(
    client: AsyncClient, admin_headers: dict[str, str]
):
    response = await client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "username": "dev_ops",
            "password": "password123",
            "prenom": "Dev",
            "nom": "Ops",
            "type_acces": "ecriture",
            "role": "developpeur",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["role"] == "developpeur"
