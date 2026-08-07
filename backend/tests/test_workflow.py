import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_workflows(client: AsyncClient, auth_headers: dict[str, str]):
    create = await client.post(
        "/api/v1/workflows",
        headers=auth_headers,
        json={"title": "Circuit test", "type": "validation_budget"},
    )
    assert create.status_code == 201
    body = create.json()
    assert body["title"] == "Circuit test"
    assert body["ref"]
    workflow_id = body["id"]
    assert len(body["steps"]) >= 1

    listing = await client.get("/api/v1/workflows", headers=auth_headers)
    assert listing.status_code == 200
    assert any(w["id"] == workflow_id for w in listing.json())

    detail = await client.get(f"/api/v1/workflows/{workflow_id}", headers=auth_headers)
    assert detail.status_code == 200
    assert detail.json()["id"] == workflow_id


@pytest.mark.asyncio
async def test_workflow_validate_step(client: AsyncClient, auth_headers: dict[str, str]):
    import json

    create = await client.post(
        "/api/v1/workflows",
        headers=auth_headers,
        json={"title": "Validation test", "type": "test"},
    )
    assert create.status_code == 201
    wf = create.json()
    active = next(s for s in wf["steps"] if s["status"] == "active")

    action = await client.post(
        f"/api/v1/workflows/{wf['id']}/steps/{active['id']}/action",
        headers=auth_headers,
        data={"payload": json.dumps({"action_type": "validate", "comment": "OK test"})},
    )
    assert action.status_code == 200
    updated = action.json()
    done_step = next(s for s in updated["steps"] if s["id"] == active["id"])
    assert done_step["status"] == "done"
