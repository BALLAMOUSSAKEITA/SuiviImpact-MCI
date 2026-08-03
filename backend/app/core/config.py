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


settings = Settings()
