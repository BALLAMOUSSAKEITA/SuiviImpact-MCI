# SuiviImpact MIPME — Inventaire complet des fonctionnalités

> Document de référence pour la refonte Next.js + FastAPI + PostgreSQL.  
> Basé sur l'analyse du code source Flask existant (`app.py`, 83 routes, 45 templates).

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Authentification & utilisateurs](#2-authentification--utilisateurs)
3. [Pages publiques](#3-pages-publiques)
4. [Plan d'Action — Objectifs (OCT / OMT / OLT)](#4-plan-daction--objectifs-oct--omt--olt)
5. [Activités PAO](#5-activités-pao)
6. [Planification trimestrielle](#6-planification-trimestrielle)
7. [Tâches hebdomadaires](#7-tâches-hebdomadaires)
8. [Suivi PAO (exécution)](#8-suivi-pao-exécution)
9. [Recommandations RCC](#9-recommandations-rcc)
10. [Missions](#10-missions)
11. [PPM — Plan de Passation des Marchés](#11-ppm--plan-de-passation-des-marchés)
12. [Projets](#12-projets)
13. [Indicateurs de performance](#13-indicateurs-de-performance)
14. [Statistiques & tableaux de bord](#14-statistiques--tableaux-de-bord)
15. [Exports Excel](#15-exports-excel)
16. [Archive documentaire (GED)](#16-archive-documentaire-ged)
17. [Administration des comptes](#17-administration-des-comptes)
18. [Modèle de données (11 tables)](#18-modèle-de-données-11-tables)
19. [Rôles, permissions & sécurité](#19-rôles-permissions--sécurité)
20. [Notifications & emails](#20-notifications--emails)
21. [Interface utilisateur (45 pages)](#21-interface-utilisateur-45-pages)
22. [API & endpoints existants (83 routes)](#22-api--endpoints-existants-83-routes)
23. [Problèmes connus à corriger dans la refonte](#23-problèmes-connus-à-corriger-dans-la-refonte)

---

## 1. Vue d'ensemble

**SuiviImpact MIPME** est une application web de gestion et de suivi d'impact pour le Bureau de Suivi et de Développement (BSD) du MIPME (Guinée).

### Objectif métier

Permettre au ministère de :
- Définir des **objectifs stratégiques** sur 3 horizons (2025, 2026, 2027)
- Décliner en **activités** par direction
- **Planifier** les activités par trimestre et par semaine
- **Suivre l'exécution** en temps réel (% d'avancement)
- Gérer les **recommandations RCC**, **missions**, **marchés PPM**, **projets** et **indicateurs**
- Produire des **statistiques** et **exports Excel**
- Archiver des **documents** institutionnels

### Stack actuelle

- **Backend** : Flask (Python), monolithe `app.py`
- **Frontend** : Jinja2 templates + CSS/JS inline
- **BDD** : MySQL (`suiviimpacts`)
- **Auth** : Flask-Login (sessions cookies)
- **Mail** : Flask-Mail (SMTP Gmail)
- **Export** : openpyxl

---

## 2. Authentification & utilisateurs

### Connexion

| Fonctionnalité | Détail |
|----------------|--------|
| Page de connexion | `/connexion` — formulaire username + password |
| Traitement login | `POST /login` — vérification hash Werkzeug (pbkdf2:sha256) |
| Comptes actifs uniquement | Filtre `etat = 0` à la connexion |
| Redirection post-login | Vers `/admin` (dashboard) |
| Déconnexion | `GET /logout` → redirect `/connexion` |

### Modèle utilisateur (`users`)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INT PK | Identifiant |
| `username` | VARCHAR | Identifiant de connexion |
| `password` | VARCHAR | Mot de passe hashé |
| `password2` | VARCHAR | Mot de passe en clair (stocké — **faille sécurité**) |
| `prenom` | VARCHAR | Prénom affiché |
| `role` | INT | `0` = utilisateur, `1` = administrateur |
| `type_acces` | VARCHAR | `"Lecture"` (Visiteur) ou `"Ecriture"` (Éditeur) |
| `etat` | INT | `0` = actif, `1` = désactivé |

### Rôles & permissions

| Rôle | Capacités UI |
|------|-------------|
| **Visiteur** (`type_acces = "Lecture"`) | Consultation seule — pas de boutons CRUD |
| **Éditeur** (`type_acces = "Ecriture"`) | Création, modification, suppression |
| **Admin** (`role = 1`) | Menu Administration visible (gestion comptes) |

> ⚠️ Les permissions sont appliquées **uniquement dans les templates HTML**, pas côté serveur Python.

---

## 3. Pages publiques

### Landing page (`/` — `index.html`)

- Vitrine institutionnelle MIPME / BSD Guinée
- Animations particules (particles.js)
- Drapeau guinéen, logos ministère
- Bouton CTA vers `/connexion`
- Assets : `style_index.css`, Animate.css, Google Fonts

### Page de connexion (`/connexion` — `connexion.html`)

- Formulaire POST vers `/login`
- Toggle visibilité mot de passe
- Messages flash via SweetAlert2
- Particules animées en arrière-plan

---

## 4. Plan d'Action — Objectifs (OCT / OMT / OLT)

### Types d'objectifs

| Code | Nom | Année | `type` en BDD |
|------|-----|-------|---------------|
| **OCT** | Objectifs Clés de Transformation | 2025 | `1` |
| **OMT** | Objectifs Moyen Terme | 2026 | `2` |
| **OLT** | Objectifs Long Terme | 2027 | `3` |

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Dashboard admin | `/admin` | GET | Hub plan d'action avec onglets années |
| Liste OCT | `/admin/oct` | GET | Objectifs type=1 (2025) |
| Liste OMT | `/admin/omt` | GET | Objectifs type=2 (2026) |
| Liste OLT | `/admin/olt` | GET | Objectifs type=3 (2027) |
| Ajouter objectif | `/ajouter_objectif` | POST | Code + type + description |
| Modifier objectif | `/admin/{oct\|omt\|olt}/update/{id}` | GET/POST | Formulaire édition |
| Supprimer objectif | `/admin/{oct\|omt\|olt}/delete/{id}` | GET | Suppression (cascade activités/tâches) |
| API description | `/admin/objectif/get/{id}` | GET | JSON `{description}` |

### Champs objectif (`objectifs`)

| Champ | Description |
|-------|-------------|
| `id` | PK auto |
| `type` | 1, 2 ou 3 |
| `code` | Code objectif (ex. OC1) |
| `description` | Texte de l'objectif |

### UI (`oct.html`, `omt.html`, `olt.html`)

- Onglets navigation 2025 / 2026 / 2027
- Tableau : Code, Année, Objectifs, Actions
- Clic ligne → navigation vers activités de l'objectif
- Actions (Écriture) : Voir, Modifier, Supprimer (SweetAlert2)
- Formulaire ajout (hub `/admin`) : code, année, description

---

## 5. Activités PAO

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Liste activités | `/activite/{objectif_id}` | GET | Activités liées à un objectif |
| Ajouter activité | `/ajouter_activite/{objectif_id}` | POST | Création avec directions, budget, trimestres |
| Modifier activité | `/admin/activite/update/{id_activite}/{id_objectif}` | GET/POST | Édition |
| Supprimer activité | `/admin/activite/delete/{id_activite}/{id_objectif}` | GET | Suppression |
| Tri par statut | `/admin/activite/tri/{critere}` | GET/POST | Filtre depuis stats |

### Critères de tri activités

| Critère | Description |
|---------|-------------|
| `non_demare` | Exécution = 0% |
| `en_cours` | 0% < exécution < 100% |
| `termine` | Exécution = 100% |
| `en_retard` | Tâches en retard |

### Champs activité (`activite`)

| Champ | Description |
|-------|-------------|
| `id` | PK |
| `code` | Code activité |
| `description` | Libellé |
| `direction` | Direction(s) responsable(s) — chaîne concaténée |
| `objectif` | FK → `objectifs.id` |
| `budget` | Budget alloué |
| `execution` | % d'exécution (calculé depuis tâches) |
| `2025_T1` … `2027_T4` | 12 colonnes booléennes (planification par trimestre) |

### Directions MIPME (13 entités)

IGNM, APIP, DNPME.CL, DNPPP, DNPSP, DNI, 3AE, ONCP, SPI-T, CPTI, FODIP, FDEG, AGESPI + option « Toutes »

### UI (`activite.html`)

- Tableau complexe : Code, Activités, Direction, Budget, colonnes trimestres 2025/2026/2027 (T1–T4 avec « X »), Actions
- Formulaire repliable « Nouvelle activité » :
  - Multi-sélection directions (chips)
  - Description, budget
  - Sélection trimestres d'exécution (boutons par année)
- Actions : Voir, Modifier, Supprimer

---

## 6. Planification trimestrielle

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Hub planification | `/admin/planification` | GET | Choix trimestre T1–T4 |
| Activités trimestre | `/admin/planification/{trimestre}` | GET | Activités planifiées pour le trimestre |
| Filtre direction | `/admin/planification/{trimestre}/{direction}` | GET | Filtre par direction |
| Tâches activité | `/admin/planification/taches/{id_activite}/{trimestre}` | GET | Liste tâches + calendrier semaines |

### Logique métier

- Un trimestre = `1`, `2`, `3` ou `4`
- Filtrage activités via colonnes `2025_T1`…`2025_T4` (année 2025 en planification actuelle)
- Filtre direction : `LIKE` sur le champ `direction`
- Option `TOUTES` → redirect sans filtre

### UI

- **`plan.html`** : onglets T1–T4 simples
- **`planification.html`** :
  - Onglets trimestre T1–T4
  - Select direction (13 directions + TOUTES)
  - Tableau : Code, Activités, Direction, bouton « Planifier »
- Navigation vers planification tâches par activité

---

## 7. Tâches hebdomadaires

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Ajouter tâche | `/ajouter_tache/{id_activite}/{trimestre}` | GET/POST | Création tâche + planning semaines |
| Modifier tâche | `/admin/tache/update/{trimestre}/{id_activite}/{id_tache}` | GET/POST | Édition |
| Supprimer tâche | `/admin/tache/delete/{trimestre}/{id_activite}/{id_tache}` | GET | Suppression |

### Champs tâche (`taches`)

| Champ | Description |
|-------|-------------|
| `id` | PK |
| `description` | Libellé tâche |
| `responsable` | Nom responsable |
| `email_responsable` | Email pour rappels |
| `activite` | FK → `activite.id` |
| `ponderation` | Poids % dans l'exécution activité |
| `situation` | `0` = en cours, `1` = terminée |
| `retard` | `0` = à jour, `1` = en retard |
| `observation` | Commentaire finalisation |
| `fichier` | Pièce jointe (nom fichier) |
| Semaines T1 | `jan_s1`…`mar_s4` (12 colonnes jan–mars) |
| Semaines T2–T4 | Colonnes similaires par trimestre |

### UI (`planification_tache_t1.html` … `t4.html`)

- Tableau calendrier : mois × semaines S1–S4
- Colonnes : description, responsable, pondération, cases semaines cochées
- Formulaire ajout : description, responsable, email, pondération, cases semaines
- Actions : Modifier, Supprimer (SweetAlert2)

### UI édition (`modifier_tache.html`)

- Grille semaines jan–déc selon trimestre
- Tous champs éditables

---

## 8. Suivi PAO (exécution)

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Suivi trimestre | `/admin/suivi/{trimestre}` | GET | Liste activités + % exécution |
| Suivi par direction | `/admin/suivi/{trimestre}/{direction}` | GET | Filtre direction |
| Suivi par code | `/admin/suivi/{code}` | GET | Filtre par code activité |
| Tâches activité | `/admin/suivi/{trimestre}/taches/{id_activite}` | GET | Liste tâches suivi |
| Détail tâche | `/admin/suivi/taches/{id_tache}/details` | GET | Tâche finalisée |
| Finaliser tâche | `/finaliser-tache/{trimestre}` | POST | Upload + observation + clôture |
| Télécharger pièce jointe | `/download/{filename}` | GET | Fichier depuis `static/images` |

### Logique finalisation tâche

1. Upload fichier (pdf, xlsx, pptx, docx, images)
2. Saisie observation
3. `situation = 1`, `retard = 0`
4. Mise à jour `activite.execution += ponderation`

### Rappels email (synchrone)

- Déclenché à chaque visite de `/admin/suivi/{trimestre}`
- Parcourt tâches non finalisées (`situation != 1`, `retard != 1`)
- Compare dates fin de semaine planifiées
- Marque `retard = 1` et envoie email via Flask-Mail

### UI

- **`suivi.html`** : onglets T1–T4, filtre direction, tableau Code/Activités/Direction/Exécution(%), bouton Tâches
- **`activite_tri.html`** : liste filtrée depuis stats (Non démarrées / En cours / Terminées / En retard)
- **`suivi_taches.html`** : statuts (Terminé ✅ / En retard / En cours), modales finalisation
- **`taches_details.html`** : détail tâche + lien fichier + observations

---

## 9. Recommandations RCC

> RCC = Recommandations Conseil de Cabinet

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Liste trimestre | `/admin/recommandation/{trimestre}` | GET/POST | Recommandations + avg exécution |
| Ajouter | `/admin/recommandation/new/{trimestre}` | POST | Création |
| Finaliser | `/admin/recommandation/finaliser/{id}/{trimestre}` | GET/POST | `execution = 100` |
| Modifier | `/admin/recommandation/update/{id}/{trimestre}` | GET/POST | Édition |
| Supprimer | `/admin/recommandation/delete/{id}/{trimestre}` | GET/POST | Suppression |
| Tri statut | `/admin/recommandation/tri/{critere}` | GET/POST | Filtre depuis stats |
| Export Excel | `/admin/export/recommandation` | GET | `Recommandations_RCC.xlsx` |

### Champs (`recommandations`)

| Champ | Description |
|-------|-------------|
| `id` | PK |
| `date` | Date recommandation |
| `description` | Texte |
| `responsable` | Responsable |
| `execution` | % exécution (0–100) |
| `observations` | Commentaires |
| `trimestre` | T1–T4 |

### Critères tri

| Critère | Condition |
|---------|-----------|
| `non_execute` | execution = 0 |
| `en_cours` | 0 < execution < 100 |
| `termine` | execution = 100 |

### UI

- Onglets T1–T4, barre avancement global (%)
- Tableau : Date, Description, Responsable, Exécution (% coloré), Observation
- Formulaire repliable ajout
- Actions : Finaliser, Modifier, Supprimer

---

## 10. Missions

### Fonctionnalités

| Action | Route | Méthode | Auth | Description |
|--------|-------|---------|------|-------------|
| Liste trimestre | `/admin/mission/{trimestre}` | GET/POST | ✅ | Missions + avg exécution |
| Ajouter | `/admin/mission/new/{trimestre}` | POST | ❌ | Création |
| Finaliser | `/admin/mission/finaliser/{id}/{trimestre}` | GET/POST | ✅ | `execution = 100` |
| Modifier | `/admin/mission/update/{id}/{trimestre}` | GET/POST | ✅ | Édition |
| Supprimer | `/admin/mission/delete/{id}/{tri}` | GET | ❌ | Suppression |
| Tri statut | `/admin/mission/tri/{critere}` | GET/POST | ✅ | Filtre depuis stats |
| Export Excel | `/admin/export/mission` | GET | ✅ | `missions.xlsx` |

### Champs (`mission`)

| Champ | Description |
|-------|-------------|
| `id` | PK |
| `date` | Date mission |
| `recommandation` | Description (nom de colonne hérité) |
| `responsable` | Responsable |
| `execution` | % exécution |
| `observations` | Commentaires |
| `trimestre` | T1–T4 |

### UI

- Identique structure RCC : onglets, barre avancement, tableau, formulaire repliable
- Actions : Finaliser, Modifier, Supprimer

---

## 11. PPM — Plan de Passation des Marchés

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Liste marchés | `/admin/ppm` | GET/POST | Tous les marchés |
| Ajouter | `/admin/ppm/new` | POST | Création marché |
| Modifier | `/admin/ppm/update/{id}` | GET/POST | Édition |
| Supprimer | `/admin/ppm/delete/{id}` | GET/POST | Suppression |
| Tri statut/type | `/admin/ppm/tri/{critere}` | GET/POST | Filtre par statut et/ou type |
| Export Excel | `/admin/export/ppm` | GET | `marches_ppm.xlsx` |

### Champs (`ppm`)

| Champ | Description |
|-------|-------------|
| `id` | PK |
| `numero` | Numéro marché |
| `intitule` | Intitulé |
| `type_marche` | Type (Cotation, Prestation, etc.) |
| `mode_passation` | Mode de passation |
| `montant_estime` | Montant estimé |
| `montant_attribue` | Montant attribué |
| `financement` | BND, FINEX, etc. |
| `date` | Date |
| `statut` | Statut workflow |
| `observations` | Commentaires |

### Statuts PPM (workflow)

1. **DAO Elaboré**
2. **DAO Publié**
3. **Marché Attribué**
4. **Contrat Signé**

### UI

- Tableau complet : N°, Intitulé, Type, Mode, Montants, Financement, Date, Statut, Observations
- Formulaire ajout avec tous champs
- Page tri filtrée depuis stats PPM

---

## 12. Projets

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Liste projets | `/admin/projets` | GET/POST | Tous les projets |
| Ajouter | `/admin/projet/new` | POST | Création |
| Modifier | `/admin/projet/update/{id}` | GET/POST | Édition |
| Supprimer | `/admin/projet/delete/{id}` | GET/POST | Suppression |
| Export Excel | `/admin/export/projet` | GET | `projets.xlsx` |

### Champs (`projets`)

| Champ | Description |
|-------|-------------|
| `id` | PK |
| `description` | Nom projet |
| `abreviation` | Abréviation |
| `cout` | Coût total |
| `bailleur` | Bailleur (BND, FINEX, etc.) |
| `part_etat` | Part État (%) |
| `part_bailleur` | Part Bailleur (%) |
| `execution_financiere` | % exécution financière |
| `execution_physique` | % exécution physique |
| `date_debut` | Date début |
| `date_fin` | Date fin |
| `observations` | Commentaires |

### UI

- Tableau : Description, Abréviation, Coût, Bailleur, Parts, Exécutions, Dates, Observations
- Formulaire ajout complet avec select bailleur

---

## 13. Indicateurs de performance

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Liste indicateurs | `/admin/indicateurs` | GET/POST | Tous les KPIs |
| Ajouter | `/admin/indicateur/new` | POST | Création |
| Modifier | `/admin/indicateur/update/{id}` | GET/POST | Édition |
| Supprimer | `/admin/indicateur/delete/{id}` | GET/POST | Suppression |

### Champs (`indicateurs`)

| Champ | Description |
|-------|-------------|
| `id` | PK |
| `code` | Code indicateur |
| `libelle` | Libellé |
| `reference` | Référence documentaire |
| `cible` | Valeur cible |
| `realise` | Valeur réalisée |

### UI

- Tableau : Code, Libellé, Référence, Cible, Réalisés
- Actions : Voir activité liée, Modifier, Supprimer

---

## 14. Statistiques & tableaux de bord

### Hub statistiques

| Route | Description |
|-------|-------------|
| `/admin/stats` | Menu stats |
| `/admin/stats/1` | Stats PAO (activités) |
| `/admin/stats/2` | Stats RCC |
| `/admin/stats/3` | Stats Missions |
| `/admin/stats/4` | Stats PPM |
| `/admin/stats/5` | Stats Projets |

### API JSON statistiques

| Route | Paramètres | Retour |
|-------|------------|--------|
| `/stats` | `?direction=` | Total, non démarré, en cours, terminé, en retard, progression |
| `/stats/rcc` | `?trimestre=` | Stats recommandations |
| `/stats/mission` | `?trimestre=` | Stats missions |
| `/stats/ppm` | `?type=` | Stats PPM par statut |
| `/stats/projet` | `?projet=` ou `all` | Exécutions financière/physique |

### Dashboards UI

| Page | Graphiques | Filtres | Cartes cliquables |
|------|-----------|---------|-------------------|
| `statistiques_activite.html` | Chart.js doughnut + barres | Direction (13) | → `/admin/activite/tri/{critere}` |
| `statistiques_rcc.html` | Chart.js | Trimestre T1–T4 | → `/admin/recommandation/tri/{critere}` |
| `statistiques_mission.html` | Chart.js + barre avancement | Trimestre | → `/admin/mission/tri/{critere}` |
| `statistiques_ppm.html` | Chart.js | Type marché | → `/admin/ppm/tri/{critere}` |
| `statistiques_projet.html` | Plotly | Select projet | Cartes exécution financière/physique |

### Cartes statistiques PAO

- Total activités
- Non démarrées (0%)
- En cours (0–100%)
- Terminées (100%)
- En retard (tâches en retard)
- Barre progression globale

---

## 15. Exports Excel

### Hub export (`/admin/export` — `export_excel.html`)

| Export | Route | Fichier généré |
|--------|-------|----------------|
| Activités | `/admin/export/activite` | `Activites_Trimestres.xlsx` |
| Tâches | `/admin/export/tache` | `Taches_Trimestres.xlsx` |
| RCC | `/admin/export/recommandation` | `Recommandations_RCC.xlsx` |
| Missions | `/admin/export/mission` | `missions.xlsx` |
| PPM | `/admin/export/ppm` | `marches_ppm.xlsx` |
| Projets | `/admin/export/projet` | `projets.xlsx` |

### Format

- Génération en mémoire via `openpyxl` (`BytesIO`)
- Styles : Font, Alignment, PatternFill, Border
- Téléchargement direct via `send_file`

---

## 16. Archive documentaire (GED)

### Fonctionnalités

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Racine archive | `/admin/archive` | GET | Dossiers racine + fichiers orphelins |
| Voir dossier | `/dossier/{dossier_id}` | GET | Navigation arborescence |
| Créer dossier | `/creer-dossier` | POST | Avec `parent_id` optionnel |
| Renommer dossier | `/renommer-dossier/{id}` | POST | Renommage |
| Supprimer dossier | `/supprimer-dossier/{id}` | POST | CASCADE sous-dossiers/fichiers |
| Upload fichier | `/upload-fichier` | POST | Drag-and-drop + parcourir |
| Supprimer fichier | `/supprimer-fichier/{id}` | POST | Disque + BDD |

### Tables

**`dossiers`** : `id`, `nom`, `parent_id` (FK self)  
**`fichiers`** : `id`, `nom`, `chemin`, `dossier_id` (FK nullable), `taille`

### UI

- Arborescence dossiers avec fil d'Ariane
- Drag-and-drop upload
- Modales Bootstrap renommage/suppression
- Table fichiers : Nom, Type, Taille, Date

---

## 17. Administration des comptes

| Action | Route | Méthode | Description |
|--------|-------|---------|-------------|
| Formulaire création | `/admin/compte` | GET | Page profil/admin |
| Créer compte | `/admin/compte/nouveau` | POST | username, password, prénom, type_acces |
| Liste comptes | `/admin/compte/listes` | GET/POST | Tous les users |
| Activer | `/admin/compte/activer/{id}` | GET/POST | `etat = 0` |
| Désactiver | `/admin/compte/desactiver/{id}` | GET/POST | `etat = 1` |
| Supprimer | `/admin/compte/supprimer/{id}` | GET | Suppression user |

### UI

- **`profile.html`** : onglets Nouveau Compte / Comptes / Déconnexion
- **`comptes.html`** : tableau N°, Prénom, Username, Password, Role — actions Activer/Désactiver/Supprimer

---

## 18. Modèle de données (11 tables)

```
users
  └── (auth)

objectifs (type 1/2/3)
  └── activite (FK objectif)
        └── taches (FK activite)

recommandations (par trimestre)
mission (par trimestre)
ppm
projets
indicateurs

dossiers (parent_id → self)
  └── fichiers (FK dossier_id)
```

### Normalisation recommandée pour PostgreSQL

| Problème actuel | Solution cible |
|-----------------|----------------|
| 12 colonnes `2025_T1`…`2027_T4` | Table `activite_trimestres(activite_id, annee, trimestre, planifie)` |
| Colonnes semaines dynamiques dans `taches` | Table `tache_semaines(tache_id, annee, mois, semaine, planifie)` |
| `direction` en chaîne concaténée | Table `directions` + table pivot `activite_directions` |
| `password2` en clair | Supprimer — hash uniquement |
| Pas de FK explicites | Contraintes FK + ON DELETE CASCADE |

---

## 19. Rôles, permissions & sécurité

### État actuel

| Aspect | État |
|--------|------|
| Auth routes | ~78/83 protégées par `@login_required` |
| RBAC serveur | ❌ Absent |
| RBAC UI | ✅ Templates Jinja2 |
| CSRF | Partiel (Flask-WTF sur login) |
| Secrets en dur | ❌ SMTP password dans code |
| Upload validation | Extension whitelist uniquement |
| HTTPS cookies | Configuré mais dépend déploiement |

### Routes non protégées (failles)

- `/admin/recommandation/new/{trimestre}` — `@login_required` commenté
- `/admin/mission/new/{trimestre}` — `@login_required` commenté
- `/admin/mission/delete/{id}/{tri}` — aucun décorateur

### Cible refonte

- JWT + refresh tokens
- RBAC middleware FastAPI (decorators `@require_role`, `@require_write_access`)
- Rate limiting login
- Variables d'environnement pour secrets
- Validation Pydantic stricte
- Audit log des actions sensibles

---

## 20. Notifications & emails

### Rappels retard tâches

| Aspect | Détail |
|--------|--------|
| Déclencheur | Visite page `/admin/suivi/{trimestre}` |
| Mécanisme | Synchrone (pas Celery) |
| Contenu | Email au responsable tâche en retard |
| SMTP | Gmail (`bsd.mcipme@gmail.com`) |
| Marquage | `retard = 1` en BDD |

### Cible refonte

- Celery + Redis pour jobs async
- Cron quotidien vérification retards
- Templates email HTML
- Historique notifications en BDD

---

## 21. Interface utilisateur (45 pages)

### Navigation sidebar (`partials/sidebar.html`)

```
Plan d'Action
├── Objectifs 2025/2026/2027
Planification
├── T1 / T2 / T3 / T4
Suivi
├── PAO (trimestres)
├── RCC (trimestres)
├── Missions (trimestres)
├── PPM
├── Projets
└── Indicateurs
Statistiques
Export Excel
Archive
Administration (si role=1)
```

### Bibliothèques JS/CSS

| Lib | Usage |
|-----|-------|
| SweetAlert2 | Confirmations, toasts, menus action |
| Chart.js | Stats PAO, RCC, Missions, PPM |
| Plotly | Stats Projets |
| Bootstrap 5 | Modales archive, suivi tâches |
| Font Awesome 6 | Icônes |
| particles.js | Landing + login |

### Patterns UI transversaux

- `ultra-modern-table` — tableaux principaux
- `tabs` / `tab active` — navigation trimestres/années
- `form-container` + collapse — formulaires repliables
- `stat-card` — cartes stats cliquables
- `direction-option` — chips multi-sélection

---

## 22. API & endpoints existants (83 routes)

### Récapitulatif par zone

| Zone | Nb routes |
|------|-----------|
| Auth / public | 4 |
| Admin dashboard | 1 |
| Objectifs OCT/OMT/OLT | 7 |
| Activités | 5 |
| Planification | 6 |
| Suivi PAO | 7 |
| Recommandations RCC | 7 |
| Missions | 7 |
| PPM | 6 |
| Projets | 5 |
| Indicateurs | 4 |
| Statistiques | 7 |
| Exports | 7 |
| Comptes admin | 6 |
| Archive | 7 |
| Tri/filtres | 4 |
| **Total** | **83** |

---

## 23. Problèmes connus à corriger dans la refonte

| # | Problème | Priorité |
|---|----------|----------|
| 1 | Permissions UI-only (pas serveur) | 🔴 Critique |
| 2 | Routes sans auth (missions, recommandations) | 🔴 Critique |
| 3 | `password2` stocké en clair | 🔴 Critique |
| 4 | Credentials SMTP en dur | 🔴 Critique |
| 5 | Monolithe 3600+ lignes | 🟠 Haute |
| 6 | Colonnes trimestres/semaines en SQL wide table | 🟠 Haute |
| 7 | Rappels email synchrones | 🟡 Moyenne |
| 8 | Double `/` dans URL activité | 🟡 Moyenne |
| 9 | CSS dupliqué inline (omt/olt) | 🟢 Basse |
| 10 | Fichiers CSS non utilisés | 🟢 Basse |

---

*Document généré le 2 août 2026 — Refonte SuiviImpact MIPME*
