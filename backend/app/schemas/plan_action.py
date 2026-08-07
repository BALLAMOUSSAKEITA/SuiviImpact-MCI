from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class TrimestrePlan(BaseModel):
    annee: int = Field(ge=2025, le=2027)
    trimestre: int = Field(ge=1, le=4)


class ObjectifCreate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1)


class ObjectifUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = Field(default=None, min_length=1)


class ObjectifRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    description: str
    created_at: datetime
    updated_at: datetime


class TachePlanCreate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1)


class TachePlanUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = Field(default=None, min_length=1)


class TachePlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    description: str
    created_at: datetime
    updated_at: datetime


class DirectionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    libelle: str
    directeur_nom: str | None = None
    email_directeur: str | None = None


class DirectionCreate(BaseModel):
    libelle: str = Field(min_length=1, max_length=100)
    directeur_nom: str = Field(min_length=1, max_length=150)
    email_directeur: str = Field(min_length=3, max_length=255)


class DirectionUpdate(BaseModel):
    libelle: str | None = Field(default=None, min_length=1, max_length=100)
    directeur_nom: str | None = Field(default=None, min_length=1, max_length=150)
    email_directeur: str | None = Field(default=None, min_length=3, max_length=255)


class ActiviteCreate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1)
    budget: Decimal = Field(default=Decimal("0"), ge=0)
    direction_ids: list[int] = Field(default_factory=list)
    trimestres: list[TrimestrePlan] = Field(default_factory=list)


class ActiviteUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = Field(default=None, min_length=1)
    budget: Decimal | None = Field(default=None, ge=0)
    direction_ids: list[int] | None = None
    trimestres: list[TrimestrePlan] | None = None


class ActiviteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    objectif_id: int
    code: str
    description: str
    budget: Decimal
    execution: Decimal
    direction_ids: list[int]
    trimestres: list[TrimestrePlan]
    created_at: datetime
    updated_at: datetime
