import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


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
        return str(path.relative_to(self.base_dir)), file.filename or stored_name, len(content)

    def resolve_path(self, relative_path: str) -> Path:
        full = (self.base_dir / relative_path).resolve()
        if not str(full).startswith(str(self.base_dir.resolve())):
            raise HTTPException(status_code=400, detail="Chemin invalide")
        if not full.exists():
            raise HTTPException(status_code=404, detail="Fichier introuvable")
        return full

    def delete_file(self, relative_path: str) -> None:
        path = self.resolve_path(relative_path)
        path.unlink(missing_ok=True)


storage_service = StorageService()
