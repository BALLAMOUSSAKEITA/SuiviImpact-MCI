import pytest
from httpx import AsyncClient

from app.services import storage_service as storage_module


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


@pytest.mark.asyncio
async def test_dossier_delete_preview_nested(client: AsyncClient, auth_headers: dict[str, str]):
    parent = await client.post(
        "/api/v1/archive/dossiers",
        headers=auth_headers,
        json={"nom": "Parent", "parent_id": None},
    )
    parent_id = parent.json()["id"]

    child = await client.post(
        "/api/v1/archive/dossiers",
        headers=auth_headers,
        json={"nom": "Enfant", "parent_id": parent_id},
    )
    child_id = child.json()["id"]

    upload = await client.post(
        "/api/v1/archive/fichiers",
        headers=auth_headers,
        files={"file": ("doc.pdf", b"%PDF-1.4 nested", "application/pdf")},
        data={"dossier_id": str(child_id)},
    )
    assert upload.status_code == 201

    preview = await client.get(
        f"/api/v1/archive/dossiers/{parent_id}/delete-preview",
        headers=auth_headers,
    )
    assert preview.status_code == 200
    body = preview.json()
    assert body["est_vide"] is False
    assert body["sous_dossiers_total"] == 1
    assert body["fichiers_total"] == 1

    delete_parent = await client.delete(
        f"/api/v1/archive/dossiers/{parent_id}",
        headers=auth_headers,
    )
    assert delete_parent.status_code == 204

    gone = await client.get(
        f"/api/v1/archive/dossiers/{child_id}",
        headers=auth_headers,
    )
    assert gone.status_code == 404


@pytest.mark.asyncio
async def test_delete_dossier_with_missing_file_on_disk(
    client: AsyncClient, auth_headers: dict[str, str]
):
    dossier = await client.post(
        "/api/v1/archive/dossiers",
        headers=auth_headers,
        json={"nom": "APIP", "parent_id": None},
    )
    dossier_id = dossier.json()["id"]

    upload = await client.post(
        "/api/v1/archive/fichiers",
        headers=auth_headers,
        files={"file": ("note.pdf", b"%PDF-1.4 orphan", "application/pdf")},
        data={"dossier_id": str(dossier_id)},
    )
    assert upload.status_code == 201
    pdf_files = list(storage_module.storage_service.base_dir.rglob("*.pdf"))
    assert len(pdf_files) == 1
    pdf_files[0].unlink()

    delete_dossier = await client.delete(
        f"/api/v1/archive/dossiers/{dossier_id}",
        headers=auth_headers,
    )
    assert delete_dossier.status_code == 204
