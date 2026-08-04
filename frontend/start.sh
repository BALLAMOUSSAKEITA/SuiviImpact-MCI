#!/bin/bash
set -euo pipefail

if [ ! -f ".next/standalone/server.js" ]; then
  echo "ERROR: build standalone manquant. Lancez « npm run build » avant le démarrage."
  exit 1
fi

# Requis pour le mode standalone Next.js (cf. next.config output: standalone)
if [ -d "public" ] && [ ! -d ".next/standalone/public" ]; then
  cp -r public .next/standalone/public
fi
if [ -d ".next/static" ] && [ ! -d ".next/standalone/.next/static" ]; then
  mkdir -p .next/standalone/.next
  cp -r .next/static .next/standalone/.next/static
fi

export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"

echo "==> Démarrage Next.js (standalone) sur le port ${PORT}..."
exec node .next/standalone/server.js
