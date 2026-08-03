# Sprint 9 — Qualité, Migration complète & Déploiement

**Durée estimée :** 2–3 semaines  
**Objectif :** Tests, migration totale des données, sécurisation, déploiement production.

**Prérequis :** Sprints 0–8 terminés

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S9-01 | En tant qu'équipe, je veux migrer toutes les données MySQL | Script validé, 0 perte |
| S9-02 | En tant qu'équipe, je veux des tests automatisés | Coverage backend > 70% |
| S9-03 | En tant qu'équipe, je veux un déploiement production | Docker/K8s ou VPS |
| S9-04 | En tant qu'utilisateur, je veux une app stable | UAT validé par MIPME |
| S9-05 | En tant qu'équipe, je veux une documentation utilisateur | Guide admin + utilisateur |

---

## Migration données MySQL → PostgreSQL

### Script master `scripts/migrate_all.py`

| Ordre | Table source MySQL | Table cible PostgreSQL | Transformations |
|-------|-------------------|------------------------|-----------------|
| 1 | `users` | `users` | role, type_acces, etat, re-hash |
| 2 | `objectifs` | `objectifs` | type 1/2/3 → enum |
| 3 | `activite` | `activites` + pivots | split trimestres + directions |
| 4 | `taches` | `taches` + `tache_semaines` | split colonnes semaines |
| 5 | `recommandations` | `recommandations` | direct |
| 6 | `mission` | `missions` | rename colonne |
| 7 | `ppm` | `ppm` | statut → enum |
| 8 | `projets` | `projets` | direct |
| 9 | `indicateurs` | `indicateurs` | direct |
| 10 | `dossiers` | `dossiers` | direct |
| 11 | `fichiers` | `fichiers_archive` | rename + migrate files |

### Validation post-migration

```python
# scripts/validate_migration.py
assert count_mysql("objectifs") == count_pg("objectifs")
assert count_mysql("activite") == count_pg("activites")
# Vérifier sommes execution, pondération
# Vérifier intégrité FK
# Spot-check 10 enregistrements aléatoires
```

### Migration fichiers

- Copier `static/images/*` → `/uploads/taches/` et `/uploads/archive/`
- Mettre à jour chemins en BDD

---

## Tests

### Backend (pytest)

| Module | Tests |
|--------|-------|
| Auth | login, refresh, RBAC, comptes |
| Objectifs | CRUD, cascade |
| Activités | CRUD, trimestres, directions |
| Tâches | CRUD, finalisation, execution |
| Suivi | stats, filtres |
| RCC/Missions | CRUD, finalisation |
| PPM/Projets/Indicateurs | CRUD |
| Stats | agrégations correctes |
| Exports | fichiers Excel valides |
| Archive | arborescence, upload |

```bash
pytest tests/ --cov=app --cov-report=html
# Target: > 70% coverage
```

### Frontend (optionnel Sprint 9)

- Playwright E2E : login → CRUD objectif → activité → tâche → finalisation
- Vitest unit tests composants critiques

### Tests de charge (optionnel)

- Locust ou k6 : 50 utilisateurs concurrents sur `/api/v1/stats/activites`

---

## Sécurité — Checklist finale

| # | Item | Statut |
|---|------|--------|
| 1 | Secrets en variables d'environnement | ☐ |
| 2 | JWT httpOnly cookies ou secure storage | ☐ |
| 3 | RBAC sur toutes routes mutations | ☐ |
| 4 | CORS restrictif (domaine production) | ☐ |
| 5 | Rate limiting login (slowapi) | ☐ |
| 6 | Validation upload (type, taille) | ☐ |
| 7 | HTTPS obligatoire | ☐ |
| 8 | Headers sécurité (HSTS, CSP, X-Frame) | ☐ |
| 9 | Suppression `password2` | ☐ |
| 10 | Audit log actions sensibles | ☐ |
| 11 | Backup PostgreSQL automatique | ☐ |
| 12 | Pas de credentials en repo Git | ☐ |

---

## Déploiement

### Architecture production recommandée

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (reverse   │
                    │   proxy)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌─────▼─────┐ ┌────▼─────┐
     │  Next.js   │ │  FastAPI  │ │  Celery  │
     │  (SSR)     │ │  (API)    │ │  Worker  │
     └────────────┘ └─────┬─────┘ └────┬─────┘
                          │            │
                    ┌─────▼─────┐ ┌────▼─────┐
                    │ PostgreSQL│ │  Redis   │
                    └───────────┘ └──────────┘
```

### Docker Compose production

```yaml
services:
  nginx:
    image: nginx:alpine
    ports: ["443:443", "80:80"]
    volumes: [./nginx.conf, ./certs]

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: https://api.suiviimpact.gov.gn

  backend:
    build: ./backend
    env_file: .env.production

  celery-worker:
    build: ./backend
    command: celery -A app.tasks worker

  celery-beat:
    build: ./backend
    command: celery -A app.tasks beat

  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
```

### Variables d'environnement production

```env
# .env.production (NE PAS COMMITER)
DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/suiviimpact
SECRET_KEY=...
JWT_SECRET=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASSWORD=...
REDIS_URL=redis://redis:6379/0
UPLOAD_DIR=/data/uploads
CORS_ORIGINS=https://suiviimpact.gov.gn
```

---

## UAT (User Acceptance Testing)

### Scénarios métier MIPME

| # | Scénario | Modules |
|---|----------|---------|
| 1 | Créer objectif 2025 → activité → tâches T1 → finaliser | PAO complet |
| 2 | Consulter stats PAO filtrées par direction DNPME.CL | Stats |
| 3 | Ajouter recommandation RCC T2 → finaliser | RCC |
| 4 | Ajouter marché PPM → changer statut workflow | PPM |
| 5 | Exporter activités Excel | Export |
| 6 | Upload document archive → naviguer dossier | Archive |
| 7 | Admin crée compte Visiteur → vérifier pas de boutons CRUD | Auth/RBAC |
| 8 | Recevoir email retard tâche | Notifications |

---

## Documentation livrables

| Document | Audience |
|----------|----------|
| `docs/guide-utilisateur.md` | Utilisateurs MIPME |
| `docs/guide-admin.md` | Administrateurs |
| `docs/deploiement.md` | Équipe technique |
| `docs/api.md` | Développeurs (ou Swagger auto) |
| `docs/migration.md` | Procédure migration MySQL |

---

## Tâches détaillées

### Semaine 1

- [ ] Script migration master + validation
- [ ] Migration fichiers physiques
- [ ] Tests backend complets
- [ ] Fix bugs identifiés en UAT interne

### Semaine 2

- [ ] Tests E2E critiques
- [ ] Checklist sécurité
- [ ] Setup environnement staging
- [ ] UAT avec équipe MIPME

### Semaine 3

- [ ] Corrections post-UAT
- [ ] Déploiement production
- [ ] Monitoring (Sentry, logs structurés)
- [ ] Backup automatique PostgreSQL
- [ ] Documentation utilisateur
- [ ] Formation équipe MIPME (session 2h)
- [ ] Bascule DNS / coupure ancienne app

---

## Plan de rollback

1. Garder ancienne app Flask + MySQL en standby 30 jours
2. Backup PostgreSQL avant bascule
3. Procédure retour arrière documentée
4. Communication utilisateurs avant bascule

---

## Definition of Done (projet complet)

- [ ] 100% fonctionnalités [FONCTIONNALITES.md](./FONCTIONNALITES.md) implémentées
- [ ] Données migrées et validées
- [ ] Tests backend > 70% coverage
- [ ] UAT MIPME signé
- [ ] Production déployée HTTPS
- [ ] Emails retard fonctionnels (Celery)
- [ ] Documentation livrée
- [ ] Formation effectuée
- [ ] Ancienne app décommissionnée (J+30)

---

## Récapitulatif des 10 sprints

| Sprint | Durée | Livrable principal |
|--------|-------|-------------------|
| 0 | 1–2 sem | Infrastructure + PostgreSQL |
| 1 | 1–2 sem | Auth + comptes |
| 2 | 2 sem | Objectifs + activités |
| 3 | 2 sem | Planification + tâches |
| 4 | 2 sem | Suivi PAO + emails |
| 5 | 2 sem | RCC + Missions |
| 6 | 2 sem | PPM + Projets + Indicateurs |
| 7 | 2 sem | Stats + Exports |
| 8 | 1–2 sem | Archive GED |
| 9 | 2–3 sem | Migration + Déploiement |
| **Total** | **~17–21 sem** | **Application complète** |

---

*Fin de la planification de refonte SuiviImpact MIPME*
