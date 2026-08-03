# Sprint 0 — Fondations & Architecture

**Durée estimée :** 1–2 semaines  
**Objectif :** Mettre en place l'infrastructure, l'architecture et le schéma PostgreSQL de base.

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S0-01 | En tant que développeur, je veux un monorepo structuré | Dossiers `frontend/`, `backend/`, `docs/` créés |
| S0-02 | En tant que développeur, je veux PostgreSQL avec migrations | Alembic configuré, première migration exécutée |
| S0-03 | En tant que développeur, je veux une API FastAPI fonctionnelle | `/health` retourne 200, Swagger accessible |
| S0-04 | En tant que développeur, je veux Next.js connecté à l'API | Page d'accueil fetch `/health` avec succès |
| S0-05 | En tant que développeur, je veux Docker Compose local | `docker compose up` lance PG + API + frontend |

---

## Livrables techniques

### Backend (FastAPI)

```
backend/
├── app/
│   ├── main.py                 # Point d'entrée FastAPI
│   ├── core/
│   │   ├── config.py           # Settings (Pydantic BaseSettings)
│   │   ├── database.py         # SQLAlchemy engine + session
│   │   └── security.py         # (placeholder Sprint 1)
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── api/
│   │   └── v1/
│   │       └── router.py       # Router principal
│   └── services/
├── alembic/                    # Migrations
├── tests/
├── requirements.txt
└── Dockerfile
```

**Dépendances clés :**
- `fastapi`, `uvicorn[standard]`
- `sqlalchemy[asyncio]`, `asyncpg`, `alembic`
- `pydantic-settings`, `python-dotenv`
- `pytest`, `httpx`

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing (placeholder)
│   │   └── (auth)/
│   ├── components/
│   │   └── ui/                 # shadcn/ui
│   ├── lib/
│   │   └── api.ts              # Client API (fetch/axios)
│   └── types/
├── public/
├── package.json
└── Dockerfile
```

**Dépendances clés :**
- Next.js 14+ App Router, TypeScript
- Tailwind CSS, shadcn/ui
- TanStack Query
- axios ou fetch wrapper

### Infrastructure

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: suiviimpact
      POSTGRES_USER: suivi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres]
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
```

---

## Schéma PostgreSQL initial (tables de référence)

### Tables à créer en Sprint 0

```sql
-- Directions MIPME (données de référence)
CREATE TABLE directions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL
);

-- Seed 13 directions
INSERT INTO directions (code, libelle) VALUES
('IGNM', 'IGNM'), ('APIP', 'APIP'), ('DNPME.CL', 'DNPME.CL'),
('DNPPP', 'DNPPP'), ('DNPSP', 'DNPSP'), ('DNI', 'DNI'),
('3AE', '3AE'), ('ONCP', 'ONCP'), ('SPI-T', 'SPI-T'),
('CPTI', 'CPTI'), ('FODIP', 'FODIP'), ('FDEG', 'FDEG'),
('AGESPI', 'AGESPI');
```

> Les tables métier (`users`, `objectifs`, etc.) seront créées dans les sprints suivants via Alembic.

---

## Tâches détaillées

### Semaine 1

- [ ] Initialiser repo Git (branches `main`, `develop`)
- [ ] Créer structure monorepo
- [ ] Setup FastAPI avec CORS, middleware logging
- [ ] Configurer PostgreSQL + SQLAlchemy async
- [ ] Setup Alembic + migration `directions`
- [ ] Endpoint `GET /api/v1/health`
- [ ] Setup Next.js + Tailwind + shadcn/ui
- [ ] Client API TypeScript avec types générés (optionnel OpenAPI)
- [ ] Docker Compose local

### Semaine 2

- [ ] CI GitHub Actions : lint + tests backend
- [ ] CI GitHub Actions : lint + build frontend
- [ ] Documentation API (Swagger auto FastAPI)
- [ ] Variables d'environnement (`.env.example`)
- [ ] README technique projet
- [ ] Revue architecture avec équipe

---

## Definition of Done

- [ ] `docker compose up` démarre les 3 services sans erreur
- [ ] `GET http://localhost:8000/api/v1/health` → `{"status": "ok"}`
- [ ] Frontend affiche statut API sur la landing
- [ ] Migration Alembic appliquée sur PostgreSQL
- [ ] CI passe sur push

---

## Risques

| Risque | Mitigation |
|--------|------------|
| Choix sync vs async SQLAlchemy | Async recommandé pour FastAPI |
| Hébergement production non défini | Prévoir configs env dev/staging/prod |

---

## Dépendances

Aucune — sprint initial.

**Sprint suivant :** [SPRINT-01-authentification.md](./SPRINT-01-authentification.md)
