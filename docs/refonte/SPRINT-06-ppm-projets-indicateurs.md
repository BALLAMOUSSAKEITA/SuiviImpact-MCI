# Sprint 6 — PPM, Projets & Indicateurs

**Durée estimée :** 2 semaines  
**Objectif :** Implémenter les modules PPM (marchés), Projets (bailleurs) et Indicateurs de performance.

**Prérequis :** Sprint 1 (auth)

---

## User Stories

### PPM (Plan de Passation des Marchés)

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S6-01 | En tant qu'utilisateur, je veux voir la liste des marchés PPM | Tableau complet |
| S6-02 | En tant qu'éditeur, je veux ajouter un marché | Tous champs + statut workflow |
| S6-03 | En tant qu'éditeur, je veux modifier/supprimer un marché | CRUD |
| S6-04 | En tant qu'utilisateur, je veux filtrer PPM par type/statut | Depuis stats |

### Projets

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S6-05 | En tant qu'utilisateur, je veux voir la liste des projets | Tableau bailleurs |
| S6-06 | En tant qu'éditeur, je veux CRUD projets | Coût, parts, exécutions |
| S6-07 | En tant qu'utilisateur, je veux voir exécutions financière/physique | % affichés |

### Indicateurs

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S6-08 | En tant qu'utilisateur, je veux voir les indicateurs KPI | Code, libellé, cible, réalisé |
| S6-09 | En tant qu'éditeur, je veux CRUD indicateurs | CRUD complet |

---

## Modèle de données PostgreSQL

```sql
CREATE TYPE ppm_statut AS ENUM (
    'dao_elabore', 'dao_publie', 'marche_attribue', 'contrat_signe'
);

CREATE TABLE ppm (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(20),
    intitule TEXT NOT NULL,
    type_marche VARCHAR(50),
    mode_passation VARCHAR(100),
    montant_estime NUMERIC(15,2),
    montant_attribue NUMERIC(15,2),
    financement VARCHAR(50),  -- BND, FINEX, etc.
    date_marche DATE,
    statut ppm_statut DEFAULT 'dao_elabore',
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projets (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    abreviation VARCHAR(20),
    cout NUMERIC(15,2),
    bailleur VARCHAR(50),  -- BND, FINEX, etc.
    part_etat NUMERIC(5,2),
    part_bailleur NUMERIC(5,2),
    execution_financiere NUMERIC(5,2) DEFAULT 0,
    execution_physique NUMERIC(5,2) DEFAULT 0,
    date_debut DATE,
    date_fin DATE,
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE indicateurs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    libelle TEXT NOT NULL,
    reference VARCHAR(100),
    cible NUMERIC(10,2),
    realise NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API FastAPI

### PPM

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/ppm` | Auth | Liste marchés |
| GET | `/api/v1/ppm?type={t}&statut={s}` | Auth | Filtre tri |
| POST | `/api/v1/ppm` | Écriture | Créer |
| PUT | `/api/v1/ppm/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/ppm/{id}` | Écriture | Supprimer |

### Projets

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/projets` | Auth | Liste |
| POST | `/api/v1/projets` | Écriture | Créer |
| PUT | `/api/v1/projets/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/projets/{id}` | Écriture | Supprimer |

### Indicateurs

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/indicateurs` | Auth | Liste KPIs |
| POST | `/api/v1/indicateurs` | Écriture | Créer |
| PUT | `/api/v1/indicateurs/{id}` | Écriture | Modifier |
| DELETE | `/api/v1/indicateurs/{id}` | Écriture | Supprimer |

---

## Pages Next.js

| Route | Module | Description |
|-------|--------|-------------|
| `/admin/ppm` | PPM | Liste + formulaire ajout |
| `/admin/ppm/{id}/modifier` | PPM | Édition |
| `/admin/ppm/tri/{critere}` | PPM | Filtre stats |
| `/admin/projets` | Projets | Liste + formulaire |
| `/admin/projets/{id}/modifier` | Projets | Édition |
| `/admin/indicateurs` | Indicateurs | Liste + formulaire |
| `/admin/indicateurs/{id}/modifier` | Indicateurs | Édition |

### Composants UI

- `PpmTable` — N°, Intitulé, Type, Mode, Montants, Financement, Date, Statut
- `PpmStatutBadge` — workflow coloré (4 étapes)
- `ProjetTable` — Description, Coût, Bailleur, Parts, Exécutions
- `IndicateurTable` — Code, Libellé, Référence, Cible, Réalisé
- `MontantFormatter` — format GNF / millions

---

## Données de référence

### Statuts PPM (workflow)

| Enum | Label UI |
|------|----------|
| `dao_elabore` | DAO Elaboré |
| `dao_publie` | DAO Publié |
| `marche_attribue` | Marché Attribué |
| `contrat_signe` | Contrat Signé |

### Types marché (filtres stats)

Cotation, Prestation intellectuelle, Fournitures, Travaux, etc.

### Bailleurs

BND, FINEX, Banque Mondiale, BAD, etc.

---

## Tâches détaillées

### Backend

- [ ] Migrations ppm, projets, indicateurs
- [ ] CRUD routers + services
- [ ] Enum ppm_statut avec labels FR
- [ ] Filtre PPM par type + statut
- [ ] Tests CRUD
- [ ] Migration MySQL → PostgreSQL (3 tables)

### Frontend

- [ ] Page PPM avec formulaire repliable
- [ ] Page édition PPM
- [ ] Page tri PPM
- [ ] Page Projets + édition
- [ ] Page Indicateurs + édition
- [ ] Badges statut PPM colorés

---

## Definition of Done

- [ ] CRUD PPM complet avec workflow statuts
- [ ] CRUD Projets avec exécutions
- [ ] CRUD Indicateurs
- [ ] Filtres PPM depuis stats
- [ ] RBAC écriture sur mutations
- [ ] Données migrées

**Sprint suivant :** [SPRINT-07-statistiques-exports.md](./SPRINT-07-statistiques-exports.md)
