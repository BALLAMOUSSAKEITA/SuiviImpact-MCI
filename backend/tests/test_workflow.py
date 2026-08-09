import json

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_only_directeur_can_create_workflow(
    client: AsyncClient, auth_headers: dict[str, str], directeur_headers: dict[str, str]
):
    denied = await client.post(
        "/api/v1/workflows",
        headers=auth_headers,
        data={
            "payload": json.dumps({"title": "X", "type": "test"}),
        },
        files={"fichier": ("doc.pdf", b"%PDF-1.4", "application/pdf")},
    )
    assert denied.status_code == 403

    create = await client.post(
        "/api/v1/workflows",
        headers=directeur_headers,
        data={"payload": json.dumps({"title": "Circuit test", "type": "validation_budget"})},
        files={"fichier": ("doc.pdf", b"%PDF-1.4 test", "application/pdf")},
    )
    assert create.status_code == 201, create.text
    body = create.json()
    assert body["title"] == "Circuit test"
    directeur_step = next(s for s in body["steps"] if s["role"] == "directeur")
    assert any(a.get("file_name") for a in directeur_step["actions"])


@pytest.mark.asyncio
async def test_validate_only_own_step(
    client: AsyncClient, directeur_headers: dict[str, str], auth_headers: dict[str, str]
):
    create = await client.post(
        "/api/v1/workflows",
        headers=directeur_headers,
        data={"payload": json.dumps({"title": "Validation test", "type": "test"})},
        files={"fichier": ("doc.pdf", b"%PDF-1.4", "application/pdf")},
    )
    assert create.status_code == 201
    wf = create.json()
    active = next(s for s in wf["steps"] if s["status"] == "active")

    bsd_try = await client.post(
        f"/api/v1/workflows/{wf['id']}/steps/{active['id']}/action",
        headers=auth_headers,
        data={"payload": json.dumps({"action_type": "validate", "comment": "hack"})},
    )
    assert bsd_try.status_code == 403

    action = await client.post(
        f"/api/v1/workflows/{wf['id']}/steps/{active['id']}/action",
        headers=directeur_headers,
        data={"payload": json.dumps({"action_type": "validate", "comment": "OK test"})},
    )
    assert action.status_code == 200
    updated = action.json()
    done_step = next(s for s in updated["steps"] if s["id"] == active["id"])
    assert done_step["status"] == "done"
    bsd_step = next(s for s in updated["steps"] if s["role"] == "bsd")
    assert bsd_step["status"] == "active"


@pytest.mark.asyncio
async def test_only_bsd_can_delete_workflow(
    client: AsyncClient,
    directeur_headers: dict[str, str],
    auth_headers: dict[str, str],
):
    create = await client.post(
        "/api/v1/workflows",
        headers=directeur_headers,
        data={"payload": json.dumps({"title": "À supprimer", "type": "test"})},
        files={"fichier": ("doc.pdf", b"%PDF-1.4", "application/pdf")},
    )
    assert create.status_code == 201
    wf_id = create.json()["id"]

    denied_directeur = await client.delete(
        f"/api/v1/workflows/{wf_id}",
        headers=directeur_headers,
    )
    assert denied_directeur.status_code == 403

    deleted = await client.delete(
        f"/api/v1/workflows/{wf_id}",
        headers=auth_headers,
    )
    assert deleted.status_code == 204

    missing = await client.get(
        f"/api/v1/workflows/{wf_id}",
        headers=auth_headers,
    )
    assert missing.status_code == 404
