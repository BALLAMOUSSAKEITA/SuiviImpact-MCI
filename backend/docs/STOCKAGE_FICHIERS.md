# Stockage des fichiers — règles pour les migrations

Les fichiers uploadés sont enregistrés sur le disque sous `UPLOAD_DIR` (défaut : `uploads/`).
En base, seul un **chemin relatif POSIX** est stocké (ex. `archive/abc123_note.pdf`).

## Colonnes concernées

| Table | Colonne |
|-------|---------|
| `fichiers_archive` | `chemin_stockage` |
| `tache_fichiers` | `chemin_stockage` |
| `activites` | `tdr_chemin` |
| `planification_projet_activites` | `rapport_chemin` |
| `taches` | `fichier_path` |
| `workflow_actions` | `file_path` |

## Ce qu'une migration Alembic ne doit **pas** faire

- Renommer ou supprimer ces colonnes sans script de migration de données.
- Modifier le contenu des chemins existants (préfixe, encodage, séparateurs).
- Changer la sémantique de `UPLOAD_DIR` sans déplacer le répertoire physique.

## Bonnes pratiques

1. **Nouveaux fichiers** : toujours via `StorageService.save_upload()` (chemins relatifs `.as_posix()`).
2. **Déploiement** : conserver le même `UPLOAD_DIR` et monter le même volume de fichiers.
3. **Migration de données legacy** (`scripts/migrate_all.py`) : vérifier que chaque `chemin_stockage` importé pointe vers un fichier existant sous `UPLOAD_DIR`.
4. **Avant une migration risquée** : sauvegarder la base **et** le répertoire `uploads/`.
5. **Après migration ou déploiement** : `python scripts/check_storage_integrity.py --strict`

## Suppression de dossiers archive

La suppression tolère les entrées orphelines (fichier en base mais absent du disque) :
l'entrée est retirée de la base même si le fichier physique n'existe plus.
