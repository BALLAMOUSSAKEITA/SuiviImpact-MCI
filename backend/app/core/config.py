from pydantic import computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _split_csv(value: str) -> list[str]:
    stripped = value.strip()
    if not stripped:
        return []
    if stripped.startswith("["):
        import json

        parsed = json.loads(stripped)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
        return [str(parsed).strip()]
    return [item.strip() for item in stripped.split(",") if item.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "SuiviImpact API"
    DEBUG: bool = False
    DATABASE_URL: str = (
        "postgresql+asyncpg://suivi:suivi_dev_password@localhost:5432/suiviimpact"
    )
    # Chaîne CSV ou JSON — évite le parse JSON automatique de pydantic-settings sur list[str]
    CORS_ORIGINS: str = "http://localhost:3000"
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ALGORITHM: str = "HS256"

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_PRENOM: str = "Administrateur"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list[str] = [
        "pdf", "xlsx", "pptx", "docx", "png", "jpg", "jpeg", "gif"
    ]

    REDIS_URL: str = "redis://localhost:6379/0"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@suiviimpact.gov.gn"

    DEFAULT_ANNEE: int = 2026
    PORT: int = 8000

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        """Railway fournit postgresql:// ou postgres:// — async exige postgresql+asyncpg://."""
        if not isinstance(value, str):
            return value
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        return value

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins(self) -> list[str]:
        origins = _split_csv(self.CORS_ORIGINS)
        return origins or ["http://localhost:3000"]


settings = Settings()