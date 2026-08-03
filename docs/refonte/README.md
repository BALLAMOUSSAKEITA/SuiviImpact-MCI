# Refonte SuiviImpact MIPME

Documentation de cadrage pour la migration complète de l'application **SuiviImpact** vers une nouvelle stack technique.

## Contexte

L'application actuelle est un monolithe **Flask + Jinja2 + MySQL** (~3 640 lignes dans un seul `app.py`, 83 routes, 45 templates HTML). Elle sert au **Ministère de l'Industrie et des Petites et Moyennes Entreprises (MIPME)** pour le suivi d'impact, la planification et l'exécution des plans d'action.

## Stack cible

| Couche | Technologie actuelle | Technologie cible |
|--------|---------------------|-------------------|
| Frontend | Jinja2 + HTML/CSS/JS | **Next.js 14+** (App Router, TypeScript) |
| Backend | Flask (monolithique) | **FastAPI** (API REST, OpenAPI) |
| Base de données | MySQL | **PostgreSQL** |
| Auth | Flask-Login (sessions) | JWT + refresh tokens (ou sessions sécurisées) |
| ORM | SQL brut (`mysql.connector`) | **SQLAlchemy 2.0** + Alembic |
| Fichiers | `static/images` | Stockage objet (S3/MinIO) ou volume persistant |
| Emails | Flask-Mail (Gmail SMTP) | Service async (Celery + SMTP ou SendGrid) |
| Exports | openpyxl | openpyxl / xlsxwriter côté FastAPI |

## Contenu de ce dossier

| Fichier | Description |
|---------|-------------|
| [FONCTIONNALITES.md](./FONCTIONNALITES.md) | Inventaire exhaustif de toutes les fonctionnalités existantes |
| [SPRINT-00-fondations.md](./SPRINT-00-fondations.md) | Setup projet, architecture, BDD PostgreSQL |
| [SPRINT-01-authentification.md](./SPRINT-01-authentification.md) | Auth, rôles, gestion des comptes |
| [SPRINT-02-plan-action.md](./SPRINT-02-plan-action.md) | Objectifs OCT/OMT/OLT et activités |
| [SPRINT-03-planification.md](./SPRINT-03-planification.md) | Planification trimestrielle et tâches |
| [SPRINT-04-suivi-pao.md](./SPRINT-04-suivi-pao.md) | Suivi d'exécution PAO, finalisation, rappels |
| [SPRINT-05-rcc-missions.md](./SPRINT-05-rcc-missions.md) | Recommandations RCC et missions |
| [SPRINT-06-ppm-projets-indicateurs.md](./SPRINT-06-ppm-projets-indicateurs.md) | PPM, projets, indicateurs |
| [SPRINT-07-statistiques-exports.md](./SPRINT-07-statistiques-exports.md) | Dashboards stats et exports Excel |
| [SPRINT-08-archive-admin.md](./SPRINT-08-archive-admin.md) | Archive documentaire et administration |
| [SPRINT-09-qualite-deploiement.md](./SPRINT-09-qualite-deploiement.md) | Tests, migration données, déploiement |

## Architecture cible (vue d'ensemble)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js (Frontend)                    │
│  App Router · Server Components · TanStack Query         │
│  shadcn/ui · Recharts/Chart.js · SweetAlert2 equivalent  │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (JSON)
┌──────────────────────────▼──────────────────────────────┐
│                    FastAPI (Backend)                     │
│  Routers modulaires · Pydantic · SQLAlchemy · Alembic    │
│  JWT Auth · RBAC · Upload · Export Excel · Celery mail    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   PostgreSQL                             │
│  11+ tables · contraintes FK · index · migrations        │
└─────────────────────────────────────────────────────────┘
```

## Modules fonctionnels (11 zones)

1. **Authentification & accueil** — Login, landing page, déconnexion
2. **Plan d'Action (PAO)** — Objectifs 2025/2026/2027, activités
3. **Planification** — Activités par trimestre, tâches hebdomadaires
4. **Suivi PAO** — Exécution, finalisation tâches, pièces jointes
5. **RCC** — Recommandations Conseil de Cabinet
6. **Missions** — Suivi missions trimestrielles
7. **PPM** — Plan de Passation des Marchés
8. **Projets** — Projets bailleurs (BND, FINEX…)
9. **Indicateurs** — KPIs de performance
10. **Statistiques & Exports** — Dashboards + Excel
11. **Archive & Admin** — GED + gestion comptes

## Durée estimée

| Phase | Sprints | Durée estimée |
|-------|---------|---------------|
| Fondations | Sprint 0 | 1–2 semaines |
| Cœur métier PAO | Sprints 1–4 | 6–8 semaines |
| Modules annexes | Sprints 5–6 | 4–5 semaines |
| Stats, exports, archive | Sprints 7–8 | 3–4 semaines |
| Qualité & déploiement | Sprint 9 | 2–3 semaines |
| **Total** | **10 sprints** | **~16–22 semaines** |

## Points d'attention identifiés dans l'existant

- Permissions (`type_acces`, `role`) appliquées surtout côté templates, pas côté serveur
- Certaines routes sans `@login_required` (missions, recommandations)
- Rappels email déclenchés à la visite de page (pas de job planifié)
- Credentials SMTP en dur dans le code
- Monolithe difficile à maintenir et tester
- Colonnes trimestres dynamiques (`2025_T1`…`2027_T4`) en colonnes SQL — à normaliser en PostgreSQL

## Prochaine étape recommandée

1. Valider ce cadrage avec l'équipe métier MIPME
2. Démarrer **Sprint 0** (fondations)
3. Migrer les données MySQL → PostgreSQL en parallèle du Sprint 2
