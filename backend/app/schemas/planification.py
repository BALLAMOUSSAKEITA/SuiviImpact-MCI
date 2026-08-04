from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class TacheStatut(str, Enum):
    EN_COURS = "en_cours"
    TERMINEE = "terminee"
    EN_RETARD = "en_retard"


class SemainePlan(BaseModel):
    mois: int = Field(ge=1, le=12)
    semaine: int = Field(ge=1, le=4)


class SemaineRead(SemainePlan):
    model_config = ConfigDict(from_attributes=True)

    id: int
    planifie: bool
    date_fin_semaine: date | None = None


class TacheCreate(BaseModel):
    trimestre: int = Field(ge=1, le=4)
    annee: int = Field(default=2025, ge=2025, le=2027)
    description: str = Field(min_length=1)
    responsable: str = Field(min_length=1, max_length=100)
    email_responsable: str | None = Field(default=None, max_length=255)
    ponderation: Decimal = Field(gt=0, le=100)
    semaines: list[SemainePlan] = Field(default_factory=list)


class TacheUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1)
    responsable: str | None = Field(default=None, min_length=1, max_length=100)
    email_responsable: str | None = Field(default=None, max_length=255)
    ponderation: Decimal | None = Field(default=None, gt=0, le=100)
    semaines: list[SemainePlan] | None = None


class TacheFichierRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom_original: str
    mime_type: str | None
    taille: int | None
    uploaded_at: datetime


class TacheRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activite_id: int
    trimestre: int
    annee: int
    description: str
    responsable: str
    email_responsable: str | None
    ponderation: Decimal
    statut: TacheStatut
    observation: str | None
    semaines: list[SemaineRead]
    fichiers: list[TacheFichierRead] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class PlanificationActiviteRead(BaseModel):
    id: int
    code: str
    description: str
    execution: Decimal
    budget: Decimal
    objectif_id: int
    direction_ids: list[int]
    nb_taches: int = 0
