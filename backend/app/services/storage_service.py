"""Stockage des fichiers uploadés (chemins relatifs POSIX depuis UPLOAD_DIR).

Règles de migration (ne pas casser les fichiers existants) :
- Les colonnes `chemin_stockage` / `*_chemin` en base sont des chemins relatifs stables ;
  ne jamais les renommer, tronquer ou réécrire sans script de migration de données.
- Ne pas changer UPLOAD_DIR sur un déploiement qui réutilise la même base sans déplacer
  physiquement le répertoire correspondant.
- Les nouvelles migrations Alembic ne doivent pas modifier le format des chemins enregistrés.
  Voir backend/docs/STOCKAGE_FICHIERS.md.
"""

import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

# Colonnes SQL contenant des chemins relatifs vers UPLOAD_DIR (référence migrations).
STORAGE_PATH_COLUMNS = (
    "fichiers_archive.chemin_stockage",
    "tache_fichiers.chemin_stockage",
    "activites.tdr_chemin",
    "planification_projet_activites.rapport_chemin",
    "taches.fichier_path",
    "workflow_actions.file_path",
)


class StorageService:
    def __init__(self, base_dir: str | None = None):
        self.base_dir = Path(base_dir or settings.UPLOAD_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _validate_extension(self, filename: str) -> str:
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Extension non autorisée: {ext}",
            )
        return ext

    async def save_upload(self, file: UploadFile, subdir: str) -> tuple[str, str, int]:
        ext = self._validate_extension(file.filename or "file")
        target_dir = self.base_dir / subdir
        target_dir.mkdir(parents=True, exist_ok=True)
        stored_name = f"{uuid.uuid4().hex}_{file.filename}"
        path = target_dir / stored_name

        content = await file.read()
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise HTTPException(status_code=400, detail="Fichier trop volumineux")

        path.write_bytes(content)
        relative = path.relative_to(self.base_dir).as_posix()
        return relative, file.filename or stored_name, len(content)

    def resolve_path(self, relative_path: str) -> Path:
        normalized = relative_path.replace("\\", "/")
        full = (self.base_dir / normalized).resolve()
        if not str(full).startswith(str(self.base_dir.resolve())):
            raise HTTPException(status_code=400, detail="Chemin invalide")
        if not full.exists():
            raise HTTPException(status_code=404, detail="Fichier introuvable")
        return full

    def delete_file(self, relative_path: str) -> None:
        path = self.resolve_path(relative_path)
        path.unlink(missing_ok=True)

    def try_delete_file(self, relative_path: str) -> bool:
        """Supprime le fichier s'il existe ; ignore les entrées orphelines (absent du disque)."""
        normalized = relative_path.replace("\\", "/")
        full = (self.base_dir / normalized).resolve()
        if not str(full).startswith(str(self.base_dir.resolve())):
            return False
        if not full.exists():
            return False
        full.unlink(missing_ok=True)
        return True


storage_service = StorageService()
