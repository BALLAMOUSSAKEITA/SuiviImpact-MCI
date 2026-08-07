import pytest
from httpx import AsyncClient


EXPORT_PATHS = [
    "/api/v1/exports/activites",
    "/api/v1/exports/taches",
    "/api/v1/exports/recommandations",
    "/api/v1/exports/missions",
    "/api/v1/exports/ppm",
    "/api/v1/exports/projets",
]

STATS_PATHS = [
    "/api/v1/stats/activites",
    "/api/v1/stats/recommandations",
    "/api/v1/stats/missions",
    "/api/v1/stats/ppm",
    "/api/v1/stats/projets",
]


@pytest.mark.asyncio
@pytest.mark.parametrize("path", EXPORT_PATHS)
async def test_exports_return_excel(client: AsyncClient, auth_headers: dict[str, str], path: str):
    response = await client.get(path, headers=auth_headers)
    assert response.status_code == 200
    assert "spreadsheet" in response.headers.get("content-type", "")
    assert len(response.content) > 100


@pytest.mark.asyncio
@pytest.mark.parametrize("path", STATS_PATHS)
async def test_stats_endpoints(client: AsyncClient, auth_headers: dict[str, str], path: str):
    response = await client.get(path, headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), dict)
