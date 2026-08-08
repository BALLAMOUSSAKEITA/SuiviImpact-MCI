import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.plan_action import Activite, ActiviteTrimestre, Objectif
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


async def _seed_activite(db_session: AsyncSession) -> int:
    objectif = Objectif(code="OC-P", description="Objectif planif")
    db_session.add(objectif)
    await db_session.flush()

    activite = Activite(
        objectif_id=objectif.id,
        code="AP01",
        description="Activité planifiée T1",
        budget=5000,
    )
    db_session.add(activite)
    await db_session.flush()

    db_session.add(
        ActiviteTrimestre(
            activite_id=activite.id,
            annee=2026,
            trimestre=1,
            planifie=True,
        )
    )
    await db_session.commit()
    return activite.id


@pytest.mark.asyncio
async def test_list_planification_trimestre(client: AsyncClient, db_session: AsyncSession):
    await _seed_activite(db_session)
    headers = await _auth_headers(client)

    response = await client.get("/api/v1/planification/2026/1", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["code"] == "AP01"


@pytest.mark.asyncio
async def test_create_tache_with_ponderation_validation(
    client: AsyncClient, db_session: AsyncSession
):
    activite_id = await _seed_activite(db_session)
    headers = await _auth_headers(client)

    payload = {
        "trimestre": 1,
        "annee": 2026,
        "description": "Rédiger le rapport T1",
        "responsable": "M. Diallo",
        "email_responsable": "diallo@mipme.gov.gn",
        "ponderation": 60,
        "semaines": [{"mois": 1, "semaine": 1}, {"mois": 1, "semaine": 2}],
    }
    first = await client.post(
        f"/api/v1/activites/{activite_id}/taches",
        headers=headers,
        json=payload,
    )
    assert first.status_code == 201

    payload["ponderation"] = 50
    second = await client.post(
        f"/api/v1/activites/{activite_id}/taches",
        headers=headers,
        json=payload,
    )
    assert second.status_code == 400
    assert "Pondération" in second.json()["detail"]


@pytest.mark.asyncio
async def test_update_and_delete_tache(client: AsyncClient, db_session: AsyncSession):
    activite_id = await _seed_activite(db_session)
    headers = await _auth_headers(client)

    payload = {
        "trimestre": 1,
        "annee": 2026,
        "description": "Tâche à modifier",
        "responsable": "M. Diallo",
        "email_responsable": "diallo@mipme.gov.gn",
        "ponderation": 40,
        "semaines": [],
    }
    create = await client.post(
        f"/api/v1/activites/{activite_id}/taches",
        headers=headers,
        json=payload,
    )
    assert create.status_code == 201
    tache_id = create.json()["id"]

    update = await client.put(
        f"/api/v1/taches/{tache_id}",
        headers=headers,
        json={"description": "Tâche modifiée", "ponderation": 40},
    )
    assert update.status_code == 200
    assert update.json()["description"] == "Tâche modifiée"

    delete = await client.delete(f"/api/v1/taches/{tache_id}", headers=headers)
    assert delete.status_code == 204
