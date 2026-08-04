from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

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

    DEFAULT_ANNEE: int = 2025
    PORT: int = 8000

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        """Railway fournit postgresql:// — SQLAlchemy async exige postgresql+asyncpg://."""
        if isinstance(value, str) and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                import json

                return json.loads(stripped)
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return ["http://localhost:3000"]


settings = Settings()
