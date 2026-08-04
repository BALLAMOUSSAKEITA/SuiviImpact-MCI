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


settings = Settings()
