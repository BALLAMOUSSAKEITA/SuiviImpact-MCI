# Sprint 7 — Statistiques & Exports Excel

**Durée estimée :** 2 semaines  
**Objectif :** Dashboards statistiques interactifs et exports Excel de toutes les entités.

**Prérequis :** Sprints 2–6 (données métier disponibles)

---

## User Stories

| ID | Story | Critères d'acceptation |
|----|-------|------------------------|
| S7-01 | En tant qu'utilisateur, je veux un hub statistiques | Menu PAO/RCC/Missions/PPM/Projets |
| S7-02 | En tant qu'utilisateur, je veux voir les stats PAO | Cartes + graphiques Chart.js |
| S7-03 | En tant qu'utilisateur, je veux filtrer stats PAO par direction | 13 directions |
| S7-04 | En tant qu'utilisateur, je veux cliquer une carte → liste filtrée | Navigation tri |
| S7-05 | En tant qu'utilisateur, je veux stats RCC/Missions/PPM/Projets | Dashboards dédiés |
| S7-06 | En tant qu'utilisateur, je veux exporter en Excel | 6 types d'export |
| S7-07 | En tant qu'utilisateur, je veux un hub export | Menu téléchargements |

---

## API FastAPI — Statistiques (JSON)

| Route | Paramètres | Retour |
|-------|------------|--------|
| `GET /api/v1/stats/activites` | `?direction={code}` | `{total, non_demare, en_cours, termine, en_retard, progression}` |
| `GET /api/v1/stats/recommandations` | `?trimestre={t}&annee={a}` | idem |
| `GET /api/v1/stats/missions` | `?trimestre={t}&annee={a}` | idem |
| `GET /api/v1/stats/ppm` | `?type={type_marche}` | `{dao_elabore, dao_publie, marche_attribue, contrat_signe, total}` |
| `GET /api/v1/stats/projets` | `?projet_id={id}` ou `all` | `{total, execution_financiere, execution_physique}` |

### Exemple réponse stats activités

```json
{
  "total": 45,
  "non_demare": 8,
  "en_cours": 22,
  "termine": 12,
  "en_retard": 3,
  "progression": 67.5
}
```

---

## API FastAPI — Exports Excel

| Route | Fichier | Contenu |
|-------|---------|---------|
| `GET /api/v1/exports/activites` | `Activites_Trimestres.xlsx` | Activités + trimestres |
| `GET /api/v1/exports/taches` | `Taches_Trimestres.xlsx` | Tâches + semaines |
| `GET /api/v1/exports/recommandations` | `Recommandations_RCC.xlsx` | RCC par trimestre |
| `GET /api/v1/exports/missions` | `missions.xlsx` | Missions |
| `GET /api/v1/exports/ppm` | `marches_ppm.xlsx` | Marchés PPM |
| `GET /api/v1/exports/projets` | `projets.xlsx` | Projets |

### Implémentation export

```python
# services/export_service.py
from openpyxl import Workbook
from io import BytesIO

async def export_activites(db) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Activités"
    # Headers stylés (Font, PatternFill, Border)
    # Data rows from PostgreSQL
    buffer = BytesIO()
    wb.save(buffer)
    return buffer
```

Retour : `StreamingResponse` avec `Content-Disposition: attachment`.

---

## Pages Next.js

| Route | Équivalent | Description |
|-------|------------|-------------|
| `/admin/stats` | `/admin/stats` | Hub stats |
| `/admin/stats/pao` | `/admin/stats/1` | Dashboard PAO |
| `/admin/stats/rcc` | `/admin/stats/2` | Dashboard RCC |
| `/admin/stats/missions` | `/admin/stats/3` | Dashboard Missions |
| `/admin/stats/ppm` | `/admin/stats/4` | Dashboard PPM |
| `/admin/stats/projets` | `/admin/stats/5` | Dashboard Projets |
| `/admin/export` | `/admin/export` | Hub exports |

### Composants UI

- `StatsHub` — onglets navigation dashboards
- `StatCard` — carte cliquable avec compteur animé
- `ProgressBarGlobal` — barre progression %
- `DirectionFilter` — select 13 directions
- `TrimestreFilter` — T1–T4
- `ChartDoughnut` — Recharts ou Chart.js wrapper
- `ChartBar` — graphiques barres
- `ChartPlotly` — stats projets (Recharts alternative)
- `ExportButton` — téléchargement direct API

### Navigation cartes → tri

| Dashboard | Carte | Route tri |
|-----------|-------|-----------|
| PAO | Non démarrées | `/admin/activite/tri/non_demare` |
| PAO | En cours | `/admin/activite/tri/en_cours` |
| PAO | Terminées | `/admin/activite/tri/termine` |
| PAO | En retard | `/admin/activite/tri/en_retard` |
| RCC | idem | `/admin/recommandation/tri/{critere}` |
| Missions | idem | `/admin/mission/tri/{critere}` |
| PPM | Par statut | `/admin/ppm/tri/{critere}?type={type}` |

---

## Tâches détaillées

### Backend

- [ ] Service stats activités (requêtes agrégées)
- [ ] Service stats RCC, missions, PPM, projets
- [ ] Routers stats JSON
- [ ] Service export Excel (openpyxl) — 6 exports
- [ ] Routers export (StreamingResponse)
- [ ] Tests stats (fixtures BDD)
- [ ] Tests export (vérifier headers, row count)

### Frontend

- [ ] Hub statistiques
- [ ] Dashboard PAO : cartes + Chart.js/Recharts + filtre direction
- [ ] Dashboard RCC : filtre trimestre
- [ ] Dashboard Missions : filtre trimestre + barre avancement
- [ ] Dashboard PPM : filtre type marché
- [ ] Dashboard Projets : select projet + graphique
- [ ] Animation compteurs (count-up)
- [ ] Hub export avec 6 boutons téléchargement
- [ ] TanStack Query pour fetch stats

---

## Bibliothèques graphiques (Next.js)

| Ancien | Nouveau recommandé |
|--------|-------------------|
| Chart.js | Recharts (React natif) ou Chart.js via react-chartjs-2 |
| Plotly | Recharts ou Tremor |

---

## Definition of Done

- [ ] 5 dashboards stats fonctionnels
- [ ] Filtres direction/trimestre/type/projet
- [ ] Cartes cliquables → pages tri
- [ ] 6 exports Excel téléchargeables
- [ ] Graphiques interactifs
- [ ] Performance stats < 500ms

**Sprint suivant :** [SPRINT-08-archive-admin.md](./SPRINT-08-archive-admin.md)
