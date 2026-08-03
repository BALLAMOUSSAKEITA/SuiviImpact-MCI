#!/bin/sh
set -e

echo "Application des migrations Alembic..."
alembic upgrade head

echo "Démarrage de l'API FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
