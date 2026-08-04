import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.user import AccessType, User, UserRole
from app.services.user_service import seed_admin_user

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def db_session():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_maker() as session:
        yield session

    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        prenom="Admin",
        role=UserRole.ADMIN,
        type_acces=AccessType.ECRITURE,
        etat=True,
    )
    db_session.add(admin)

    visiteur = User(
        username="visiteur",
        password_hash=hash_password("visiteur123"),
        prenom="Visiteur",
        role=UserRole.USER,
        type_acces=AccessType.LECTURE,
        etat=True,
    )
    db_session.add(visiteur)
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "wrong"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_profile(client: AsyncClient):
    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    token = login.json()["access_token"]
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "admin"


@pytest.mark.asyncio
async def test_admin_can_create_user(client: AsyncClient):
    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post(
        "/api/v1/users",
        headers=headers,
        json={
            "username": "nouveau",
            "password": "password123",
            "prenom": "Nouveau",
            "type_acces": "lecture",
            "role": "user",
        },
    )
    assert response.status_code == 201
    assert response.json()["username"] == "nouveau"


@pytest.mark.asyncio
async def test_visiteur_cannot_create_user(client: AsyncClient):
    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "visiteur", "password": "visiteur123"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post(
        "/api/v1/users",
        headers=headers,
        json={
            "username": "hack",
            "password": "password123",
            "prenom": "Hack",
            "type_acces": "lecture",
        },
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_deactivated_user_cannot_login(client: AsyncClient, db_session: AsyncSession):
    user = User(
        username="inactif",
        password_hash=hash_password("pass1234"),
        prenom="Inactif",
        role=UserRole.USER,
        type_acces=AccessType.LECTURE,
        etat=False,
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "inactif", "password": "pass1234"},
    )
    assert response.status_code == 403
