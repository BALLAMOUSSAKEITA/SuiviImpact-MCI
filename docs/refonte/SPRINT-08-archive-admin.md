# Sprint 8 — Archive documentaire & Finitions Admin

**Durée estimée :** 1–2 semaines  
**Objectif :** GED (gestion électronique des documents) et consolidation administration.

**Prérequis :** Sprint 1 (auth admin), Sprint 7 (exports)

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S8-01 | En tant qu'utilisateur, je veux voir l'archive racine | Dossiers + fichiers orphelins |
| S8-02 | En tant qu'éditeur, je veux créer un dossier | Avec parent optionnel |
| S8-03 | En tant qu'éditeur, je veux naviguer dans les sous-dossiers | Fil d'Ariane |
| S8-04 | En tant qu'éditeur, je veux renommer/supprimer un dossier | CASCADE enfants |
| S8-05 | En tant qu'éditeur, je veux uploader des fichiers | Drag-and-drop |
| S8-06 | En tant qu'utilisateur, je veux télécharger un fichier | Download sécurisé |
| S8-07 | En tant qu'éditeur, je veux supprimer un fichier | Disque + BDD |
| S8-08 | En tant qu'admin, je veux gérer les comptes (consolidation) | Revue Sprint 1 |

---

## Modèle de données PostgreSQL

```sql
CREATE TABLE dossiers (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fichiers_archive (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    chemin_stockage VARCHAR(500) NOT NULL,
    dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
    mime_type VARCHAR(100),
    taille INTEGER NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> Renommer `fichiers` → `fichiers_archive` pour éviter confusion avec `tache_fichiers`.

---

## API FastAPI

### Archive

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| GET | `/api/v1/archive` | Auth | Racine : dossiers sans parent + fichiers orphelins |
| GET | `/api/v1/archive/dossiers/{id}` | Auth | Contenu dossier + fil d'Ariane |
| POST | `/api/v1/archive/dossiers` | Écriture | Créer `{nom, parent_id?}` |
| PATCH | `/api/v1/archive/dossiers/{id}` | Écriture | Renommer `{nom}` |
| DELETE | `/api/v1/archive/dossiers/{id}` | Écriture | Supprimer CASCADE |
| POST | `/api/v1/archive/fichiers` | Écriture | Upload multipart `{dossier_id?, file}` |
| GET | `/api/v1/archive/fichiers/{id}/download` | Auth | Téléchargement |
| DELETE | `/api/v1/archive/fichiers/{id}` | Écriture | Supprimer |

### Fil d'Ariane

```json
GET /api/v1/archive/dossiers/5
{
  "dossier": {"id": 5, "nom": "Rapports 2025"},
  "breadcrumb": [
    {"id": 1, "nom": "Archive"},
    {"id": 3, "nom": "PAO"},
    {"id": 5, "nom": "Rapports 2025"}
  ],
  "sous_dossiers": [...],
  "fichiers": [...]
}
```

---

## Pages Next.js

| Route | Équivalent | Description |
|-------|------------|-------------|
| `/admin/archive` | `/admin/archive` | Racine GED |
| `/admin/archive/dossier/{id}` | `/dossier/{id}` | Navigation dossier |

### Composants UI

- `ArchiveExplorer` — layout principal
- `BreadcrumbNav` — fil d'Ariane cliquable
- `DossierGrid` — cartes dossiers avec icônes
- `FichierTable` — Nom, Type, Taille, Date, Actions
- `CreateDossierModal` — formulaire création
- `RenameDossierModal` — renommage
- `FileUploadZone` — drag-and-drop (react-dropzone)
- `ConfirmDeleteDialog` — suppression dossier/fichier

---

## Stockage fichiers

```
/uploads/archive/
├── {uuid}_{nom_original}.pdf
├── {uuid}_{nom_original}.xlsx
└── ...
```

- Abstraction `StorageService` (réutiliser Sprint 4)
- Validation extensions : pdf, xlsx, pptx, docx, png, jpg, jpeg, gif
- Limite taille : 50 Mo par fichier (configurable)

---

## Tâches détaillées

### Backend

- [ ] Migrations dossiers + fichiers_archive
- [ ] Service archive (arborescence récursive)
- [ ] Breadcrumb generator
- [ ] Upload/download/delete
- [ ] CASCADE delete dossier → sous-dossiers + fichiers
- [ ] Migration MySQL dossiers/fichiers → PostgreSQL
- [ ] Migration fichiers physiques `static/images` → `/uploads/archive/`

### Frontend

- [ ] Page archive racine
- [ ] Page navigation dossier + breadcrumb
- [ ] Modales création/renommage dossier
- [ ] Zone upload drag-and-drop
- [ ] Table fichiers avec download/delete
- [ ] Confirmations suppression

### Admin (consolidation Sprint 1)

- [ ] Revue UX pages comptes
- [ ] Audit log actions admin (optionnel)
- [ ] Tests E2E admin flow

---

## Definition of Done

- [ ] Navigation arborescente complète
- [ ] CRUD dossiers avec CASCADE
- [ ] Upload/download fichiers
- [ ] Fil d'Ariane fonctionnel
- [ ] Données archive migrées
- [ ] RBAC écriture sur mutations

**Sprint suivant :** [SPRINT-09-qualite-deploiement.md](./SPRINT-09-qualite-deploiement.md)
