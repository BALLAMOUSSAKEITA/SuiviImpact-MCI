#!/bin/sh
set -eu

if [ ! -f ".next/standalone/server.js" ]; then
  echo "ERROR: build standalone manquant. Lancez « npm run build » avant le démarrage."
  exit 1
fi

export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"

echo "==> Démarrage Next.js (standalone) sur le port ${PORT}..."
exec node .next/standalone/server.js
