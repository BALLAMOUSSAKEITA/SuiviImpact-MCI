import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.user import AccessType, User, UserRole

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    editor = User(
        username="editeur",
        password_hash=hash_password("editeur123"),
        prenom="Editeur",
        role=UserRole.USER,
        type_acces=AccessType.ECRITURE,
        etat=True,
    )
    db_session.add(editor)
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


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


async def _auth_headers(client: AsyncClient) -> dict[str, str]:
    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "editeur", "password": "editeur123"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_and_list_objectifs(client: AsyncClient):
    headers = await _auth_headers(client)

    create = await client.post(
        "/api/v1/objectifs",
        headers=headers,
        json={"type": "oct", "code": "OC1", "description": "Objectif test"},
    )
    assert create.status_code == 201

    listing = await client.get("/api/v1/objectifs?type=oct", headers=headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1
    assert listing.json()[0]["code"] == "OC1"


@pytest.mark.asyncio
async def test_create_activite_with_trimestres(client: AsyncClient):
    headers = await _auth_headers(client)

    objectif = await client.post(
        "/api/v1/objectifs",
        headers=headers,
        json={"type": "oct", "code": "OC2", "description": "Objectif activités"},
    )
    objectif_id = objectif.json()["id"]

    activite = await client.post(
        f"/api/v1/objectifs/{objectif_id}/activites",
        headers=headers,
        json={
            "code": "A01",
            "description": "Activité test",
            "budget": 1000,
            "direction_ids": [],
            "trimestres": [{"annee": 2025, "trimestre": 1}],
        },
    )
    assert activite.status_code == 201
    assert activite.json()["trimestres"] == [{"annee": 2025, "trimestre": 1}]
