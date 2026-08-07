import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_archive_dossier_and_fichier(client: AsyncClient, auth_headers: dict[str, str]):
    root = await client.get("/api/v1/archive", headers=auth_headers)
    assert root.status_code == 200

    dossier = await client.post(
        "/api/v1/archive/dossiers",
        headers=auth_headers,
        json={"nom": "Dossier test", "parent_id": None},
    )
    assert dossier.status_code == 201
    dossier_id = dossier.json()["id"]

    rename = await client.patch(
        f"/api/v1/archive/dossiers/{dossier_id}",
        headers=auth_headers,
        json={"nom": "Dossier renommé"},
    )
    assert rename.status_code == 200

    content = await client.get(
        f"/api/v1/archive/dossiers/{dossier_id}",
        headers=auth_headers,
    )
    assert content.status_code == 200

    upload = await client.post(
        "/api/v1/archive/fichiers",
        headers=auth_headers,
        files={"file": ("note.pdf", b"%PDF-1.4 archive", "application/pdf")},
        data={"dossier_id": str(dossier_id)},
    )
    assert upload.status_code == 201
    fichier_id = upload.json()["id"]

    download = await client.get(
        f"/api/v1/archive/fichiers/{fichier_id}/download",
        headers=auth_headers,
    )
    assert download.status_code == 200

    delete_file = await client.delete(
        f"/api/v1/archive/fichiers/{fichier_id}",
        headers=auth_headers,
    )
    assert delete_file.status_code == 204

    delete_dossier = await client.delete(
        f"/api/v1/archive/dossiers/{dossier_id}",
        headers=auth_headers,
    )
    assert delete_dossier.status_code == 204
