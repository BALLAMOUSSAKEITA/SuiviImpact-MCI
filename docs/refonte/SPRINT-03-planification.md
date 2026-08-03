# Sprint 3 — Planification trimestrielle & Tâches

**Durée estimée :** 2 semaines  
**Objectif :** Planifier les activités par trimestre et gérer les tâches hebdomadaires.

**Prérequis :** Sprint 2 (objectifs + activités)

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S3-01 | En tant qu'utilisateur, je veux voir le hub planification | Choix T1–T4 |
| S3-02 | En tant qu'utilisateur, je veux voir les activités planifiées pour un trimestre | Filtre colonnes trimestre |
| S3-03 | En tant qu'utilisateur, je veux filtrer par direction | Select 13 directions + Toutes |
| S3-04 | En tant qu'éditeur, je veux planifier les tâches d'une activité | Calendrier semaines |
| S3-05 | En tant qu'éditeur, je veux ajouter une tâche | Description, responsable, email, pondération, semaines |
| S3-06 | En tant qu'éditeur, je veux modifier/supprimer une tâche | CRUD complet |
| S3-07 | En tant qu'utilisateur, je veux voir le calendrier mensuel par trimestre | Grille mois × S1–S4 |

---

## Modèle de données PostgreSQL

```sql
CREATE TYPE tache_statut AS ENUM ('en_cours', 'terminee', 'en_retard');

CREATE TABLE taches (
    id SERIAL PRIMARY KEY,
    activite_id INTEGER NOT NULL REFERENCES activites(id) ON DELETE CASCADE,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    annee INTEGER NOT NULL DEFAULT 2025,
    description TEXT NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    email_responsable VARCHAR(255),
    ponderation NUMERIC(5,2) NOT NULL CHECK (ponderation > 0 AND ponderation <= 100),
    statut tache_statut DEFAULT 'en_cours',
    observation TEXT,
    fichier_path VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalisation semaines (remplace colonnes jan_s1… déc_s4)
CREATE TABLE tache_semaines (
    id SERIAL PRIMARY KEY,
    tache_id INTEGER NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
    mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
    semaine INTEGER NOT NULL CHECK (semaine BETWEEN 1 AND 4),
    planifie BOOLEAN DEFAULT TRUE,
    date_fin_semaine DATE,  -- pour calcul retard
    UNIQUE(tache_id, mois, semaine)
);
```

### Mapping trimestre → mois

| Trimestre | Mois |
|-----------|------|
| T1 | Janvier (1), Février (2), Mars (3) |
| T2 | Avril (4), Mai (5), Juin (6) |
| T3 | Juillet (7), Août (8), Septembre (9) |
| T4 | Octobre (10), Novembre (11), Décembre (12) |

---

## API FastAPI

### Planification

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/planification/{annee}/{trimestre}` | Activités planifiées |
| GET | `/api/v1/planification/{annee}/{trimestre}?direction={code}` | Filtre direction |

### Tâches

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/activites/{id}/taches?trimestre={t}&annee={a}` | Auth | Liste tâches |
| GET | `/api/v1/taches/{id}` | Auth | Détail tâche + semaines |
| POST | `/api/v1/activites/{id}/taches` | Écriture | Créer tâche |
| PUT | `/api/v1/taches/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/taches/{id}` | Écriture | Supprimer |

### Payload création tâche

```json
{
  "trimestre": 1,
  "annee": 2025,
  "description": "Rédiger le rapport T1",
  "responsable": "M. Diallo",
  "email_responsable": "diallo@mipme.gov.gn",
  "ponderation": 25,
  "semaines": [
    {"mois": 1, "semaine": 1},
    {"mois": 1, "semaine": 2},
    {"mois": 2, "semaine": 1}
  ]
}
```

---

## Pages Next.js

| Route | Équivalent | Description |
|-------|------------|-------------|
| `/admin/planification` | `/admin/planification` | Hub T1–T4 |
| `/admin/planification/{trimestre}` | `/admin/planification/{t}` | Activités trimestre |
| `/admin/planification/{trimestre}/{direction}` | idem + filtre | Filtre direction |
| `/admin/planification/taches/{activiteId}/{trimestre}` | idem | Calendrier tâches |
| `/admin/taches/{id}/modifier` | `/admin/tache/update/...` | Édition tâche |

### Composants UI

- `TrimestreTabs` — T1/T2/T3/T4
- `DirectionFilter` — select 13 directions
- `TacheCalendarGrid` — grille mois × semaines S1–S4
- `TacheForm` — formulaire avec checkboxes semaines
- `SemaineCheckbox` — case cochée par semaine planifiée

---

## Tâches détaillées

### Backend

- [ ] Migrations taches + tache_semaines
- [ ] Service calcul `date_fin_semaine` par semaine planifiée
- [ ] Query planification (JOIN activite_trimestres)
- [ ] Filtre direction (JOIN activite_directions)
- [ ] Validation pondération ≤ 100% cumulé par activité
- [ ] Tests planification + CRUD tâches
- [ ] Migration MySQL taches → PostgreSQL

### Frontend

- [ ] Hub planification avec onglets
- [ ] Page activités planifiées + filtre direction
- [ ] 4 templates calendrier (T1–T4) ou composant dynamique
- [ ] Formulaire ajout tâche avec grille semaines
- [ ] Page édition tâche
- [ ] Confirmations suppression

---

## Logique métier importante

### Validation pondération

```
SUM(taches.ponderation WHERE activite_id = X AND statut != 'terminee') <= 100
```

### Génération calendrier

Pour chaque trimestre, afficher 3 mois × 4 semaines = 12 cases cochables.

---

## Definition of Done

- [ ] Hub planification T1–T4 opérationnel
- [ ] Filtre direction fonctionnel
- [ ] CRUD tâches avec calendrier semaines
- [ ] Pondération validée côté API
- [ ] Données tâches migrées
- [ ] UI calendrier fidèle à l'existant

**Sprint suivant :** [SPRINT-04-suivi-pao.md](./SPRINT-04-suivi-pao.md)
