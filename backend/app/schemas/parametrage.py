from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MinistreParametrageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    prenom: str
    nom: str
    email: str | None = None
    updated_at: datetime | None = None


class MinistreParametrageUpdate(BaseModel):
    prenom: str = Field(min_length=1, max_length=100)
    nom: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
