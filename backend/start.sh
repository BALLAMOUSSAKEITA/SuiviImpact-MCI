#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL n'est pas défini."
  echo "Railway → service backend → Variables → Add Reference → Postgres.DATABASE_URL"
  exit 1
fi

echo "==> Migrations Alembic..."
alembic upgrade head

echo "==> Démarrage FastAPI sur le port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
