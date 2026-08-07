import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.user import AccessType, User, UserRole
from app.services import storage_service as storage_module

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(autouse=True)
def isolated_upload_dir(tmp_path, monkeypatch):
    upload_root = tmp_path / "uploads"
    upload_root.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(storage_module.storage_service, "base_dir", upload_root)


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

    editor = User(
        username="editeur",
        password_hash=hash_password("editeur123"),
        prenom="Editeur",
        nom="",
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
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "editeur", "password": "editeur123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def directeur_headers(client: AsyncClient, db_session: AsyncSession) -> dict[str, str]:
    directeur = User(
        username="directeur_test",
        password_hash=hash_password("directeur123"),
        prenom="Dir",
        nom="Test",
        role=UserRole.DIRECTEUR,
        type_acces=AccessType.LECTURE,
        etat=True,
    )
    db_session.add(directeur)
    await db_session.commit()

    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "directeur_test", "password": "directeur123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def admin_headers(client: AsyncClient, db_session: AsyncSession) -> dict[str, str]:
    admin = User(
        username="admin_test",
        password_hash=hash_password("admin_test123"),
        prenom="Admin Test",
        nom="",
        role=UserRole.ADMIN,
        type_acces=AccessType.ECRITURE,
        etat=True,
    )
    db_session.add(admin)
    await db_session.commit()

    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin_test", "password": "admin_test123"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
