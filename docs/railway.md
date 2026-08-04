# Déploiement Railway — SuiviImpact MIPME

Guide pas à pas **sans Docker** (build Nixpacks natif Railway).

---

## Architecture Railway (4 services recommandés)

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │
│   (Next.js)     │     │    (FastAPI)    │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              PostgreSQL      Redis*     Volume*
              (obligatoire)  (optionnel) (optionnel)
```

\* Redis + Celery worker : optionnels (rappels email). Volume : recommandé pour conserver les uploads.

---

## Étape 1 — Créer le projet Railway

1. Aller sur [railway.app](https://railway.app) et se connecter avec GitHub.
2. **New Project** → **Deploy from GitHub repo**.
3. Choisir le dépôt `SuiviImpact-MCI`.
4. Branche recommandée : `sprint9` (ou `main`).

---

## Étape 2 — PostgreSQL

1. Dans le projet Railway : **+ New** → **Database** → **PostgreSQL**.
2. Une fois créé, cliquer sur la base → **Variables** → copier `DATABASE_URL`.

---

## Étape 3 — Service Backend

1. **+ New** → **GitHub Repo** → même dépôt (ou **Add Service** si déjà importé).
2. **Settings** du service :
   - **Root Directory** : `backend`
   - **Start Command** : (déjà dans `backend/railway.toml`) `bash start.sh`
3. **Variables** — voir `.env.railway.backend.example` :
   - **Obligatoire** : lier PostgreSQL au service backend (pas seulement créer la base) :
     - **Variables** → **Add Reference** → `${{Postgres.DATABASE_URL}}`
     - Le nom de la variable doit être exactement `DATABASE_URL`
     - Sans cela, le backend tente `localhost:5432` et les migrations échouent
   - `SECRET_KEY` : générer avec `openssl rand -hex 32`
   - `DEBUG=false`
   - `ADMIN_PASSWORD` : mot de passe fort
   - `CORS_ORIGINS` : URL frontend (à compléter après étape 4)
4. **Networking** → **Generate Domain** → noter l’URL publique (ex. `https://suiviimpact-api.up.railway.app`).
5. **Deploy** — les migrations Alembic s’exécutent au démarrage via `start.sh`.

Vérification : ouvrir `https://VOTRE-BACKEND.up.railway.app/api/v1/health` → `{"status":"ok"}`.

---

## Étape 4 — Service Frontend

1. **+ New** → **GitHub Repo** → même dépôt.
2. **Settings** :
   - **Root Directory** : `frontend`
3. **Variables** :
   - `NEXT_PUBLIC_API_URL` = URL publique du backend (étape 3)
4. **Networking** → **Generate Domain**.
5. **Redéployer** le frontend après avoir défini `NEXT_PUBLIC_API_URL` (variable injectée au build).

Retourner sur le **backend** et mettre à jour :

```
CORS_ORIGINS=https://VOTRE-FRONTEND.up.railway.app
```

Puis redéployer le backend.

---

## Étape 5 — Volume uploads (recommandé)

Sans volume, les fichiers uploadés (tâches, archive) sont perdus à chaque redéploiement.

1. Service **backend** → **Settings** → **Volumes** → **Add Volume**.
2. Mount path : `/app/uploads`
3. Variable : `UPLOAD_DIR=uploads` (chemin relatif dans le conteneur).

---

## Étape 6 — Redis + Celery (optionnel)

Pour les rappels email automatiques :

1. **+ New** → **Database** → **Redis**.
2. Sur le service **backend**, ajouter la référence `REDIS_URL=${{Redis.REDIS_URL}}`.
3. Créer un **4e service** depuis le même repo :
   - Root Directory : `backend`
   - Start Command : `celery -A app.tasks.celery_app worker --loglevel=info`
4. Créer un **5e service** (beat) :
   - Start Command : `celery -A app.tasks.celery_app beat --loglevel=info`

Configurer SMTP sur le backend si vous activez Celery.

---

## Récapitulatif des variables

### Backend

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | ✅ | Référence PostgreSQL Railway |
| `SECRET_KEY` | ✅ | Clé JWT (32+ bytes hex) |
| `CORS_ORIGINS` | ✅ | URL(s) frontend |
| `ADMIN_PASSWORD` | ✅ | Mot de passe admin initial |
| `DEBUG` | | `false` en production |
| `REDIS_URL` | | Si Celery activé |
| `SMTP_*` | | Si emails activés |

### Frontend

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | URL publique backend |

---

## Connexion

- URL frontend → `/connexion`
- Compte par défaut : `admin` / valeur de `ADMIN_PASSWORD`

**Changez le mot de passe admin** après la première connexion (menu Comptes).

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `sh: next: not found` (frontend) | Le projet utilise `output: standalone` — le démarrage passe par `bash start.sh` (`node .next/standalone/server.js`), pas `next start`. Redéployer après mise à jour de `frontend/railway.toml`. |
| Migrations → `localhost:5432` | `DATABASE_URL` absent sur le service backend. **Add Reference** → `${{Postgres.DATABASE_URL}}` sur le **service backend**, puis redéployer. |
| CORS error | Vérifier `CORS_ORIGINS` = URL exacte du frontend (https, sans slash final) |
| API unreachable depuis le frontend | Vérifier `NEXT_PUBLIC_API_URL` puis **redéployer** le frontend |
| Migrations échouent (URL OK) | Logs backend → vérifier que PostgreSQL est **Running** et lié au bon service |
| Build frontend échoue | Logs → `npm ci` ; vérifier Root Directory = `frontend` |
| Fichiers disparus | Ajouter un Volume sur `/app/uploads` |

---

## Coûts Railway

- Hobby : ~5 $/mois de crédit inclus.
- PostgreSQL + 2 services web consomment le crédit selon l’usage.
- Surveiller **Usage** dans le dashboard.

---

## Fichiers ajoutés pour Railway

| Fichier | Rôle |
|---------|------|
| `backend/railway.toml` | Config deploy backend |
| `backend/nixpacks.toml` | Python 3.12 + install |
| `backend/start.sh` | Migrations + uvicorn sur `$PORT` |
| `frontend/railway.toml` | Config deploy frontend |
| `frontend/nixpacks.toml` | Node 20 + build Next.js |
| `frontend/start.sh` | Démarrage standalone (`server.js`) |
| `.env.railway.*.example` | Templates variables |

Docker (`docker-compose.yml`) reste disponible pour le développement local — **non utilisé** sur Railway.
