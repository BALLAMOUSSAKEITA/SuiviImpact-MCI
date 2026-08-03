# Sprint 5 — Recommandations RCC & Missions

**Durée estimée :** 2 semaines  
**Objectif :** Implémenter le suivi trimestriel des recommandations RCC et des missions.

**Prérequis :** Sprint 1 (auth), Sprint 4 (patterns suivi établis)

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S5-01 | En tant qu'utilisateur, je veux voir les recommandations RCC par trimestre | Onglets T1–T4 + barre avancement |
| S5-02 | En tant qu'éditeur, je veux ajouter une recommandation | Date, description, responsable, exécution, observations |
| S5-03 | En tant qu'éditeur, je veux finaliser une recommandation | execution = 100% |
| S5-04 | En tant qu'éditeur, je veux modifier/supprimer une recommandation | CRUD complet |
| S5-05 | En tant qu'utilisateur, je veux filtrer RCC par statut | Depuis stats |
| S5-06 | En tant qu'utilisateur, je veux voir les missions par trimestre | Identique structure RCC |
| S5-07 | En tant qu'éditeur, je veux CRUD missions | Avec auth obligatoire (corriger faille existante) |

---

## Modèle de données PostgreSQL

```sql
CREATE TABLE recommandations (
    id SERIAL PRIMARY KEY,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    annee INTEGER NOT NULL DEFAULT 2025,
    date_recommandation DATE NOT NULL,
    description TEXT NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    execution NUMERIC(5,2) DEFAULT 0 CHECK (execution >= 0 AND execution <= 100),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE missions (
    id SERIAL PRIMARY KEY,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    annee INTEGER NOT NULL DEFAULT 2025,
    date_mission DATE NOT NULL,
    description TEXT NOT NULL,  -- ancien champ "recommandation"
    responsable VARCHAR(100) NOT NULL,
    execution NUMERIC(5,2) DEFAULT 0 CHECK (execution >= 0 AND execution <= 100),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API FastAPI

### Recommandations RCC

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/recommandations?trimestre={t}&annee={a}` | Auth | Liste + avg exécution |
| POST | `/api/v1/recommandations` | Écriture | Créer |
| GET | `/api/v1/recommandations/{id}` | Auth | Détail |
| PUT | `/api/v1/recommandations/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/recommandations/{id}` | Écriture | Supprimer |
| PATCH | `/api/v1/recommandations/{id}/finaliser` | Écriture | execution = 100 |
| GET | `/api/v1/recommandations?statut={critere}` | Auth | Tri (non_execute, en_cours, termine) |

### Missions

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/missions?trimestre={t}&annee={a}` | Auth | Liste + avg exécution |
| POST | `/api/v1/missions` | Écriture | Créer (**auth obligatoire**) |
| PUT | `/api/v1/missions/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/missions/{id}` | Écriture | Supprimer (**auth obligatoire**) |
| PATCH | `/api/v1/missions/{id}/finaliser` | Écriture | execution = 100 |
| GET | `/api/v1/missions?statut={critere}` | Auth | Tri |

### Critères statut (commun)

| Critère | Condition SQL |
|---------|---------------|
| `non_execute` / `non_demare` | execution = 0 |
| `en_cours` | 0 < execution < 100 |
| `termine` | execution = 100 |

---

## Pages Next.js

| Route | Équivalent | Description |
|-------|------------|-------------|
| `/admin/recommandation/{trimestre}` | idem | RCC trimestre |
| `/admin/recommandation/{id}/modifier` | idem | Édition RCC |
| `/admin/recommandation/tri/{critere}` | idem | Liste filtrée |
| `/admin/mission/{trimestre}` | idem | Missions trimestre |
| `/admin/mission/{id}/modifier` | idem | Édition mission |
| `/admin/mission/tri/{critere}` | idem | Liste filtrée |

### Composants UI (réutilisables)

- `SuiviTrimestrielLayout` — onglets T1–T4 + barre avancement global
- `ExecutionProgressBar` — % moyen trimestre
- `RecommandationTable` — Date, Description, Responsable, Exécution (% coloré), Observation
- `SuiviFormRepliable` — formulaire ajout collapse
- `ActionMenuSuivi` — Finaliser / Modifier / Supprimer

---

## Tâches détaillées

### Backend

- [ ] Migrations recommandations + missions
- [ ] CRUD services + routers
- [ ] Calcul avg exécution par trimestre
- [ ] Endpoints tri par statut
- [ ] **Toutes routes protégées JWT + RBAC écriture**
- [ ] Tests CRUD + finalisation
- [ ] Migration MySQL → PostgreSQL

### Frontend

- [ ] Pages RCC par trimestre (4 onglets)
- [ ] Pages Missions par trimestre
- [ ] Formulaires ajout repliables
- [ ] Pages édition
- [ ] Pages tri filtrées (depuis stats)
- [ ] Couleurs exécution (rouge < 50%, orange 50–99%, vert 100%)

---

## Améliorations vs existant

| Problème ancien | Correction refonte |
|-----------------|-------------------|
| `/admin/recommandation/new` sans auth | Auth + RBAC écriture |
| `/admin/mission/new` sans auth | Auth + RBAC écriture |
| `/admin/mission/delete` sans auth | Auth + RBAC écriture |
| Colonne `recommandation` pour missions | Renommer `description` |

---

## Definition of Done

- [ ] CRUD RCC complet par trimestre
- [ ] CRUD Missions complet par trimestre
- [ ] Finalisation → 100%
- [ ] Tri par statut fonctionnel
- [ ] Barre avancement global affichée
- [ ] Toutes routes protégées
- [ ] Données migrées

**Sprint suivant :** [SPRINT-06-ppm-projets-indicateurs.md](./SPRINT-06-ppm-projets-indicateurs.md)
