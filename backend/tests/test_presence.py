import pytest
from httpx import AsyncClient

from app.models import presence_parametrage  # noqa: F401
from app.models.presence import PersonnelCabinet, SeancePresence, SeanceStatut


@pytest.mark.asyncio
async def test_check_in_with_valid_qr_pass(client: AsyncClient, auth_headers: dict, db_session):
    personnel = PersonnelCabinet(
        num_ordre=20,
        nom_complet="QR PASS USER",
        fonction="Testeur",
        categorie="Test",
        code_presence="2468",
        actif=True,
    )
    db_session.add(personnel)
    await db_session.commit()

    create_resp = await client.post(
        "/api/v1/presence/seances",
        headers=auth_headers,
        json={"titre": "Conseil QR", "date_seance": "2026-08-14"},
    )
    seance = create_resp.json()
    token = seance["token"]

    live_resp = await client.get(
        f"/api/v1/presence/seances/{seance['id']}/qr-live",
        headers=auth_headers,
    )
    assert live_resp.status_code == 200
    qr_pass = live_resp.json()["qr_pass"]

    checkin_resp = await client.post(
        f"/api/v1/presence/public/{token}/checkin",
        json={"code": "2468", "qr_pass": qr_pass},
    )
    assert checkin_resp.status_code == 200
    assert checkin_resp.json()["success"] is True


@pytest.mark.asyncio
async def test_check_in_rejects_expired_qr_pass(client: AsyncClient, auth_headers: dict, db_session):
    from app.core.config import settings
    from app.services.presence_qr_pass import generate_qr_pass

    personnel = PersonnelCabinet(
        num_ordre=21,
        nom_complet="EXPIRED QR",
        fonction="Testeur",
        categorie="Test",
        code_presence="1357",
        actif=True,
    )
    db_session.add(personnel)
    await db_session.commit()

    create_resp = await client.post(
        "/api/v1/presence/seances",
        headers=auth_headers,
        json={"titre": "Conseil expiré", "date_seance": "2026-08-14"},
    )
    token = create_resp.json()["token"]

    old_pass, _ = generate_qr_pass(settings.SECRET_KEY, token, 20, ts=1_000_000.0)
    checkin_resp = await client.post(
        f"/api/v1/presence/public/{token}/checkin",
        json={"code": "1357", "qr_pass": old_pass},
    )
    assert checkin_resp.status_code == 200
    assert checkin_resp.json()["success"] is False


@pytest.mark.asyncio
async def test_public_check_in_flow(client: AsyncClient, auth_headers: dict, db_session):
    personnel = PersonnelCabinet(
        num_ordre=1,
        nom_complet="Test USER",
        fonction="Testeur",
        categorie="Test",
        code_presence="1234",
        actif=True,
    )
    db_session.add(personnel)
    await db_session.commit()
    await db_session.refresh(personnel)

    create_resp = await client.post(
        "/api/v1/presence/seances",
        headers=auth_headers,
        json={
            "titre": "Conseil test",
            "date_seance": "2026-08-14",
        },
    )
    assert create_resp.status_code == 201
    seance = create_resp.json()
    token = seance["token"]

    info_resp = await client.get(f"/api/v1/presence/public/{token}")
    assert info_resp.status_code == 200
    assert info_resp.json()["statut"] == "ouverte"

    checkin_resp = await client.post(
        f"/api/v1/presence/public/{token}/checkin",
        json={"code": "1234"},
    )
    assert checkin_resp.status_code == 200
    body = checkin_resp.json()
    assert body["success"] is True
    assert body["nom_complet"] == "Test USER"
    assert body["fonction"] == "Testeur"

    duplicate_resp = await client.post(
        f"/api/v1/presence/public/{token}/checkin",
        json={"code": "1234"},
    )
    assert duplicate_resp.status_code == 200
    assert duplicate_resp.json()["deja_pointe"] is True

    detail_resp = await client.get(
        f"/api/v1/presence/seances/{seance['id']}",
        headers=auth_headers,
    )
    assert detail_resp.status_code == 200
    assert detail_resp.json()["nb_presents"] == 1


@pytest.mark.asyncio
async def test_list_personnel_with_placeholder_rows(client: AsyncClient, auth_headers: dict, db_session):
    db_session.add(
        PersonnelCabinet(
            num_ordre=13,
            nom_complet="",
            fonction="",
            categorie="Cabinet",
            code_presence="0013",
            actif=False,
        )
    )
    db_session.add(
        PersonnelCabinet(
            num_ordre=14,
            nom_complet="",
            fonction="Attachée de Cabinet",
            categorie="Cabinet",
            code_presence="0014",
            actif=False,
        )
    )
    await db_session.commit()

    resp = await client.get("/api/v1/presence/personnel", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 2
    by_num = {p["num_ordre"]: p for p in data}
    assert by_num[13]["nom_complet"] == ""
    assert by_num[14]["fonction"] == "Attachée de Cabinet"


@pytest.mark.asyncio
async def test_restore_personnel_seed(client: AsyncClient, auth_headers: dict, db_session):
    resp = await client.post("/api/v1/presence/personnel/restaurer-seed", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 89
    assert body["added"] == 89

    list_resp = await client.get("/api/v1/presence/personnel", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 89


@pytest.mark.asyncio
async def test_list_personnel(client: AsyncClient, auth_headers: dict, db_session):
    db_session.add(
        PersonnelCabinet(
            num_ordre=99,
            nom_complet="M Test LIST",
            fonction="Fonction",
            categorie="Cabinet",
            code_presence="0099",
            actif=True,
        )
    )
    await db_session.commit()

    resp = await client.get("/api/v1/presence/personnel", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert any(p["nom_complet"] == "M Test LIST" for p in data)


@pytest.mark.asyncio
async def test_export_seance_pdf(client: AsyncClient, auth_headers: dict, db_session):
    personnel = PersonnelCabinet(
        num_ordre=10,
        nom_complet="Export TEST",
        fonction="Testeur",
        categorie="Cabinet",
        code_presence="4321",
        actif=True,
    )
    db_session.add(personnel)
    await db_session.commit()

    create_resp = await client.post(
        "/api/v1/presence/seances",
        headers=auth_headers,
        json={"titre": "Conseil export", "date_seance": "2026-08-14"},
    )
    seance_id = create_resp.json()["id"]

    export_resp = await client.get(
        f"/api/v1/presence/seances/{seance_id}/export?format=pdf",
        headers=auth_headers,
    )
    assert export_resp.status_code == 200
    assert export_resp.headers["content-type"] == "application/pdf"
    assert export_resp.content[:4] == b"%PDF"


@pytest.mark.asyncio
async def test_close_seance_blocks_checkin(client: AsyncClient, auth_headers: dict, db_session):
    personnel = PersonnelCabinet(
        num_ordre=2,
        nom_complet="Autre USER",
        fonction="Testeur",
        categorie="Test",
        code_presence="5678",
        actif=True,
    )
    db_session.add(personnel)
    await db_session.commit()

    create_resp = await client.post(
        "/api/v1/presence/seances",
        headers=auth_headers,
        json={"titre": "Conseil clôturé", "date_seance": "2026-08-14"},
    )
    seance_id = create_resp.json()["id"]
    token = create_resp.json()["token"]

    close_resp = await client.patch(
        f"/api/v1/presence/seances/{seance_id}/cloturer",
        headers=auth_headers,
    )
    assert close_resp.status_code == 200
    assert close_resp.json()["statut"] == "fermee"

    checkin_resp = await client.post(
        f"/api/v1/presence/public/{token}/checkin",
        json={"code": "5678"},
    )
    assert checkin_resp.status_code == 200
    assert checkin_resp.json()["success"] is False
