#!/bin/bash
set -euo pipefail

echo "==> Migrations Alembic..."
alembic upgrade head

echo "==> Démarrage FastAPI sur le port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
