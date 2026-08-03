# Sprint 1 — Authentification & Gestion des utilisateurs

**Durée estimée :** 1–2 semaines  
**Objectif :** Reproduire et sécuriser le système d'authentification et la gestion des comptes.

**Prérequis :** Sprint 0 terminé

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S1-01 | En tant qu'utilisateur, je veux me connecter | Login JWT, redirect dashboard |
| S1-02 | En tant qu'utilisateur, je veux me déconnecter | Token invalidé, redirect login |
| S1-03 | En tant qu'admin, je veux créer un compte | Formulaire prénom, username, password, type_acces |
| S1-04 | En tant qu'admin, je veux lister les comptes | Tableau avec statut actif/désactivé |
| S1-05 | En tant qu'admin, je veux activer/désactiver un compte | Toggle etat, compte désactivé ne peut pas login |
| S1-06 | En tant qu'admin, je veux supprimer un compte | Confirmation + suppression BDD |
| S1-07 | En tant qu'utilisateur Lecture, je ne vois pas les boutons CRUD | RBAC UI + API |
| S1-08 | En tant qu'utilisateur, je veux une landing page | Page publique MIPME avec CTA connexion |

---

## Modèle de données

```sql
CREATE TYPE access_type AS ENUM ('lecture', 'ecriture');
CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'user',
    type_acces access_type DEFAULT 'lecture',
    etat BOOLEAN DEFAULT TRUE,  -- TRUE = actif
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> ⚠️ **Ne pas reproduire** le champ `password2` (mot de passe en clair) de l'ancien système.

---

## API FastAPI

### Endpoints Auth

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/v1/auth/login` | Non | `{username, password}` → `{access_token, refresh_token}` |
| POST | `/api/v1/auth/refresh` | Refresh token | Nouveau access token |
| POST | `/api/v1/auth/logout` | JWT | Invalidation refresh token |
| GET | `/api/v1/auth/me` | JWT | Profil utilisateur courant |

### Endpoints Admin Users

| Méthode | Route | Auth | RBAC | Description |
|---------|-------|------|------|-------------|
| GET | `/api/v1/users` | JWT | admin | Liste comptes |
| POST | `/api/v1/users` | JWT | admin | Créer compte |
| PATCH | `/api/v1/users/{id}/activate` | JWT | admin | Activer |
| PATCH | `/api/v1/users/{id}/deactivate` | JWT | admin | Désactiver |
| DELETE | `/api/v1/users/{id}` | JWT | admin | Supprimer |

### Middleware RBAC

```python
# Décorateurs à implémenter
@require_auth
@require_role("admin")
@require_write_access  # type_acces == "ecriture"
```

---

## Pages Next.js

| Route | Page | Accès |
|-------|------|-------|
| `/` | Landing MIPME | Public |
| `/connexion` | Formulaire login | Public |
| `/admin` | Dashboard (redirect) | Auth |
| `/admin/comptes` | Gestion comptes | Admin |
| `/admin/comptes/nouveau` | Création compte | Admin |

### Composants

- `AuthProvider` — context JWT + refresh auto
- `ProtectedRoute` — HOC/middleware Next.js
- `Sidebar` — menu avec condition `role === 'admin'`
- Boutons CRUD conditionnels `type_acces === 'ecriture'`

---

## Tâches détaillées

### Backend

- [ ] Migration Alembic `users`
- [ ] Modèle SQLAlchemy `User`
- [ ] Schemas Pydantic (UserCreate, UserRead, Token)
- [ ] Hash bcrypt/argon2 (passlib)
- [ ] JWT access (15 min) + refresh (7 jours)
- [ ] Router auth + users
- [ ] Middleware RBAC
- [ ] Tests unitaires auth (login, refresh, RBAC)
- [ ] Seed admin initial via script

### Frontend

- [ ] Page landing (design MIPME — particules optionnelles)
- [ ] Page connexion avec validation Zod
- [ ] Auth context + cookies httpOnly (ou localStorage sécurisé)
- [ ] Intercepteur axios refresh token
- [ ] Sidebar avec menu conditionnel
- [ ] Pages admin comptes (liste + création)
- [ ] SweetAlert2 equivalent (sonner ou shadcn toast + alert-dialog)

---

## Migration données MySQL → PostgreSQL

```python
# Script one-shot migrate_users.py
# - Lire users MySQL
# - Re-hasher si nécessaire (pbkdf2 → bcrypt)
# - Mapper role 0/1 → user/admin
# - Mapper type_acces "Lecture"/"Ecriture" → lecture/ecriture
# - Mapper etat 0/1 → TRUE/FALSE (inversé!)
```

---

## Definition of Done

- [ ] Login/logout fonctionnels
- [ ] RBAC appliqué côté API (pas seulement UI)
- [ ] Admin peut CRUD comptes
- [ ] Compte désactivé rejeté au login
- [ ] Visiteur ne peut pas POST/PUT/DELETE
- [ ] Tests auth > 80% coverage
- [ ] Pas de secrets en dur

---

## Correspondance ancien → nouveau

| Ancien (Flask) | Nouveau (FastAPI + Next.js) |
|----------------|----------------------------|
| `POST /login` | `POST /api/v1/auth/login` |
| `GET /logout` | `POST /api/v1/auth/logout` |
| `GET /connexion` | `/connexion` (Next.js) |
| `GET /` | `/` (Next.js landing) |
| `GET /admin/compte` | `/admin/comptes/nouveau` |
| `POST /admin/compte/nouveau` | `POST /api/v1/users` |
| `GET /admin/compte/listes` | `GET /api/v1/users` |
| `GET /admin/compte/activer/{id}` | `PATCH /api/v1/users/{id}/activate` |
| `GET /admin/compte/desactiver/{id}` | `PATCH /api/v1/users/{id}/deactivate` |
| `GET /admin/compte/supprimer/{id}` | `DELETE /api/v1/users/{id}` |

**Sprint suivant :** [SPRINT-02-plan-action.md](./SPRINT-02-plan-action.md)
