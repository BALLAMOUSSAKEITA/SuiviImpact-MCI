import pytest
from httpx import AsyncClient

from app.models.presence import PersonnelCabinet, SeancePresence, SeanceStatut


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
