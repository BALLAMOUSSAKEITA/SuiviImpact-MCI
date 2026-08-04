from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ObjectifType(str, Enum):
    OCT = "oct"
    OMT = "omt"
    OLT = "olt"


class TrimestrePlan(BaseModel):
    annee: int = Field(ge=2025, le=2027)
    trimestre: int = Field(ge=1, le=4)


class ObjectifCreate(BaseModel):
    type: ObjectifType
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1)


class ObjectifUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = Field(default=None, min_length=1)


class ObjectifRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: ObjectifType
    code: str
    description: str
    created_at: datetime
    updated_at: datetime


class DirectionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    libelle: str


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
