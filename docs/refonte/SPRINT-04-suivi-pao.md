# Sprint 4 — Suivi PAO (Exécution)

**Durée estimée :** 2 semaines  
**Objectif :** Suivre l'exécution des activités, finaliser les tâches, gérer les pièces jointes et les rappels email.

**Prérequis :** Sprint 3 (planification + tâches)

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S4-01 | En tant qu'utilisateur, je veux voir le suivi par trimestre | Tableau activités + % exécution |
| S4-02 | En tant qu'utilisateur, je veux filtrer par direction | Select direction |
| S4-03 | En tant qu'utilisateur, je veux voir les tâches d'une activité | Liste statuts colorés |
| S4-04 | En tant qu'éditeur, je veux finaliser une tâche | Upload fichier + observation |
| S4-05 | En tant qu'utilisateur, je veux voir le détail d'une tâche finalisée | Fichier + observations |
| S4-06 | En tant qu'utilisateur, je veux télécharger une pièce jointe | Download sécurisé |
| S4-07 | En tant que système, je veux envoyer des rappels email | Job async tâches en retard |
| S4-08 | En tant qu'utilisateur, je veux accéder à un objectif depuis le suivi | Menu action (voir/modifier/supprimer) |

---

## Modèle de données (extensions)

```sql
-- Colonne statut déjà dans taches (Sprint 3)
-- Ajout table fichiers tâches (optionnel, ou path dans taches)

CREATE TABLE tache_fichiers (
    id SERIAL PRIMARY KEY,
    tache_id INTEGER NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
    nom_original VARCHAR(255) NOT NULL,
    chemin_stockage VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    taille INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications_email (
    id SERIAL PRIMARY KEY,
    tache_id INTEGER REFERENCES taches(id),
    destinataire VARCHAR(255) NOT NULL,
    sujet VARCHAR(255),
    envoye_at TIMESTAMPTZ DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'envoye'
);
```

---

## API FastAPI

### Suivi

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/v1/suivi/{annee}/{trimestre}` | Activités + % exécution |
| GET | `/api/v1/suivi/{annee}/{trimestre}?direction={code}` | Filtre direction |
| GET | `/api/v1/suivi/code/{code}` | Filtre par code activité |
| GET | `/api/v1/suivi/{annee}/{trimestre}/activites/{id}/taches` | Tâches suivi |

### Finalisation

| Méthode | Route | RBAC | Description |
|---------|-------|------|-------------|
| POST | `/api/v1/taches/{id}/finaliser` | Écriture | Multipart: observation + fichier |
| GET | `/api/v1/taches/{id}/details` | Auth | Détail tâche finalisée |
| GET | `/api/v1/fichiers/{id}/download` | Auth | Téléchargement sécurisé |

### Logique finalisation

1. Valider fichier (extensions: pdf, xlsx, pptx, docx, png, jpg, jpeg, gif)
2. Stocker fichier (MinIO/S3 ou volume `/uploads/taches/`)
3. `statut = 'terminee'`
4. `activite.execution += tache.ponderation`
5. Enregistrer observation

---

## Jobs async (Celery + Redis)

```python
# tasks/reminders.py
@celery.task
def check_task_delays():
    """
    Exécution quotidienne (cron 8h00)
    - Parcourir taches statut='en_cours'
    - Comparer date_fin_semaine < today
    - Marquer statut='en_retard'
    - Envoyer email responsable (si pas déjà envoyé)
    """
```

### Stack email

- Celery + Redis (broker)
- FastAPI-Mail ou aiosmtplib
- Variables env : `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
- Templates HTML Jinja2 pour emails

> ⚠️ Remplacer le déclenchement synchrone à la visite de page par un job planifié.

---

## Pages Next.js

| Route | Équivalent | Description |
|-------|------------|-------------|
| `/admin/suivi/{trimestre}` | idem | Suivi activités |
| `/admin/suivi/{trimestre}/{direction}` | idem | Filtre direction |
| `/admin/suivi/{trimestre}/taches/{activiteId}` | idem | Tâches activité |
| `/admin/suivi/taches/{id}/details` | idem | Détail tâche |

### Composants UI

- `SuiviTable` — Code, Activités, Direction, Exécution(%)
- `ExecutionBadge` — couleur selon % (rouge/orange/vert)
- `TacheStatutBadge` — Terminé ✅ / En retard / En cours
- `FinaliserTacheModal` — upload + observation
- `ActionMenu` — Voir objectif (fetch API), Modifier, Supprimer
- `ActiviteTriPage` — liste filtrée depuis stats

---

## Tâches détaillées

### Backend

- [ ] Service suivi (calcul % exécution)
- [ ] Endpoint finalisation multipart
- [ ] Stockage fichiers (abstraction StorageService)
- [ ] Download sécurisé avec auth
- [ ] Setup Celery + Redis
- [ ] Task check_task_delays + send_email
- [ ] Beat schedule quotidien
- [ ] Table notifications_email
- [ ] Tests finalisation + calcul execution

### Frontend

- [ ] Pages suivi trimestre + filtre direction
- [ ] Page tâches suivi avec statuts colorés
- [ ] Modal finalisation (drag-drop upload)
- [ ] Page détail tâche + lien download
- [ ] Menu action sur ligne suivi (fetch objectif)
- [ ] Page tri activités (depuis stats)

### DevOps

- [ ] Service Redis dans docker-compose
- [ ] Worker Celery dans docker-compose
- [ ] Celery Beat scheduler

---

## Definition of Done

- [ ] Suivi trimestriel avec % exécution correct
- [ ] Finalisation tâche met à jour execution activité
- [ ] Upload/download fichiers sécurisés
- [ ] Emails retard envoyés via Celery (pas sync)
- [ ] Filtres direction et code fonctionnels
- [ ] RBAC écriture sur finalisation

**Sprint suivant :** [SPRINT-05-rcc-missions.md](./SPRINT-05-rcc-missions.md)
