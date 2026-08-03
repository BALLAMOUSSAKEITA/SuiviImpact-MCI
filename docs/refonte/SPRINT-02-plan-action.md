# Sprint 2 — Plan d'Action : Objectifs & Activités

**Durée estimée :** 2 semaines  
**Objectif :** Implémenter la hiérarchie Objectifs (OCT/OMT/OLT) → Activités.

**Prérequis :** Sprint 1 (auth + RBAC)

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S2-01 | En tant qu'éditeur, je veux voir les objectifs 2025 (OCT) | Liste paginée avec code, année, description |
| S2-02 | En tant qu'éditeur, je veux naviguer entre OCT/OMT/OLT | Onglets 2025/2026/2027 |
| S2-03 | En tant qu'éditeur, je veux créer un objectif | Formulaire code + type + description |
| S2-04 | En tant qu'éditeur, je veux modifier un objectif | Édition inline ou modal |
| S2-05 | En tant qu'éditeur, je veux supprimer un objectif | Confirmation cascade activités |
| S2-06 | En tant qu'utilisateur, je veux voir les activités d'un objectif | Clic objectif → liste activités |
| S2-07 | En tant qu'éditeur, je veux créer une activité | Directions, budget, trimestres |
| S2-08 | En tant qu'éditeur, je veux modifier/supprimer une activité | CRUD complet |
| S2-09 | En tant que visiteur, je consulte sans boutons action | RBAC UI |

---

## Modèle de données PostgreSQL

```sql
CREATE TYPE objectif_type AS ENUM ('oct', 'omt', 'olt');
-- oct=2025, omt=2026, olt=2027

CREATE TABLE objectifs (
    id SERIAL PRIMARY KEY,
    type objectif_type NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type, code)
);

CREATE TABLE activites (
    id SERIAL PRIMARY KEY,
    objectif_id INTEGER NOT NULL REFERENCES objectifs(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(15,2) DEFAULT 0,
    execution NUMERIC(5,2) DEFAULT 0 CHECK (execution >= 0 AND execution <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalisation des trimestres (remplace 12 colonnes wide table)
CREATE TABLE activite_trimestres (
    id SERIAL PRIMARY KEY,
    activite_id INTEGER NOT NULL REFERENCES activites(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL CHECK (annee BETWEEN 2025 AND 2027),
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    planifie BOOLEAN DEFAULT FALSE,
    UNIQUE(activite_id, annee, trimestre)
);

-- Normalisation directions (remplace chaîne concaténée)
CREATE TABLE activite_directions (
    activite_id INTEGER NOT NULL REFERENCES activites(id) ON DELETE CASCADE,
    direction_id INTEGER NOT NULL REFERENCES directions(id),
    PRIMARY KEY (activite_id, direction_id)
);
```

---

## API FastAPI

### Objectifs

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/objectifs?type=oct` | Auth | Liste par type |
| GET | `/api/v1/objectifs/{id}` | Auth | Détail + description JSON |
| POST | `/api/v1/objectifs` | Écriture | Créer |
| PUT | `/api/v1/objectifs/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/objectifs/{id}` | Écriture | Supprimer (cascade) |

### Activités

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/objectifs/{id}/activites` | Auth | Liste activités objectif |
| GET | `/api/v1/activites/{id}` | Auth | Détail activité |
| POST | `/api/v1/objectifs/{id}/activites` | Écriture | Créer activité |
| PUT | `/api/v1/activites/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/activites/{id}` | Écriture | Supprimer |
| GET | `/api/v1/activites?statut={critere}` | Auth | Tri par statut (stats) |

### Payload création activité

```json
{
  "code": "OC1-A01",
  "description": "Description activité",
  "budget": 50000000,
  "direction_ids": [1, 3, 5],
  "trimestres": [
    {"annee": 2025, "trimestre": 1},
    {"annee": 2025, "trimestre": 2}
  ]
}
```

---

## Pages Next.js

| Route | Équivalent ancien | Description |
|-------|-------------------|-------------|
| `/admin` | `/admin` | Hub plan d'action + formulaire ajout objectif |
| `/admin/oct` | `/admin/oct` | Objectifs 2025 |
| `/admin/omt` | `/admin/omt` | Objectifs 2026 |
| `/admin/olt` | `/admin/olt` | Objectifs 2027 |
| `/admin/objectifs/{id}/modifier` | `/admin/oct/update/{id}` | Édition objectif |
| `/activite/{objectifId}` | `/activite/{id}` | Liste activités |
| `/admin/activites/{id}/modifier` | `/admin/activite/update/...` | Édition activité |

### Composants UI

- `ObjectifTabs` — navigation OCT/OMT/OLT
- `ObjectifTable` — tableau ultra-modern (DataTable shadcn)
- `ActiviteForm` — multi-select directions (chips), sélecteur trimestres
- `ActiviteTable` — grille trimestres 2025/2026/2027 avec badges
- `ConfirmDeleteDialog` — SweetAlert equivalent

---

## Tâches détaillées

### Backend

- [ ] Migrations : objectifs, activites, activite_trimestres, activite_directions
- [ ] Models SQLAlchemy + relations
- [ ] Schemas Pydantic avec validation
- [ ] Services CRUD objectifs/activités
- [ ] Routers API v1
- [ ] Logique statut activité (non_demare, en_cours, termine, en_retard)
- [ ] Tests CRUD + cascade delete
- [ ] Script migration MySQL → PostgreSQL (objectifs + activites)

### Frontend

- [ ] Pages OCT/OMT/OLT avec onglets
- [ ] Formulaire ajout objectif (hub admin)
- [ ] Page activités avec tableau trimestres
- [ ] Formulaire activité repliable (directions chips + trimestres)
- [ ] Pages modification objectif/activité
- [ ] Intégration TanStack Query (cache, invalidation)
- [ ] Animations hover lignes table

---

## Migration données

| Table MySQL | Table PostgreSQL | Transformation |
|-------------|------------------|----------------|
| `objectifs` | `objectifs` | type 1→oct, 2→omt, 3→olt |
| `activite` | `activites` + pivots | Split colonnes `2025_T1`… en `activite_trimestres` |
| `activite.direction` | `activite_directions` | Split string → FK directions |

---

## Definition of Done

- [ ] CRUD objectifs OCT/OMT/OLT fonctionnel
- [ ] CRUD activités avec directions et trimestres
- [ ] Suppression objectif cascade activités
- [ ] RBAC écriture sur toutes mutations
- [ ] Données migrées depuis MySQL
- [ ] UI fidèle à l'existant (onglets, tableaux)

**Sprint suivant :** [SPRINT-03-planification.md](./SPRINT-03-planification.md)
