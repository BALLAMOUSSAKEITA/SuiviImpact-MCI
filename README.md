# SuiviImpact MIPME

Refonte de la plateforme de suivi d'impact du BSD (MIPME, Guinée) vers **Next.js + FastAPI + PostgreSQL**.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, TanStack Query |
| Backend | FastAPI, SQLAlchemy 2 (async), Alembic |
| Base de données | PostgreSQL 16 |
| Conteneurisation | Docker Compose |

## Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Node.js 20+ et Python 3.12+ (développement local sans Docker)

### Lancer avec Docker

```bash
cp .env.example .env
docker compose up --build
```

Services disponibles :

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| Health check | http://localhost:8000/api/v1/health |

### Développement local

**Backend :**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend :**

```bash
cd frontend
npm install
npm run dev
```

## Structure du monorepo

```
SuiviImpact/
├── backend/          # API FastAPI
├── frontend/         # Application Next.js
├── docs/refonte/     # Cadrage et sprints
├── docker-compose.yml
└── .env.example
```

## Documentation

- [Inventaire fonctionnalités](docs/refonte/FONCTIONNALITES.md)
- [Sprint 0 — Fondations](docs/refonte/SPRINT-00-fondations.md)
- [Plan de refonte](docs/refonte/README.md)

## Sprint en cours

**Sprints 0–9 terminés** — Application complète SuiviImpact MIPME.

| Sprint | Module |
|--------|--------|
| 0 | Fondations (FastAPI, Next.js, Docker) |
| 1 | Authentification JWT + comptes |
| 2 | Plan d'action OCT/OMT/OLT + activités |
| 3 | Planification trimestrielle + tâches |
| 4 | Suivi PAO + finalisation + Celery |
| 5 | RCC + Missions |
| 6 | PPM + Projets + Indicateurs |
| 7 | Statistiques + exports Excel |
| 8 | Archive GED |
| 9 | Migration, sécurité, déploiement prod |

Voir [docs/deploiement.md](docs/deploiement.md) pour la mise en production.
