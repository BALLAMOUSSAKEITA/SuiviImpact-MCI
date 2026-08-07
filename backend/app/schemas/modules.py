from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class PpmStatut(str, Enum):
    DAO_ELABORE = "dao_elabore"
    DAO_PUBLIE = "dao_publie"
    MARCHE_ATTRIBUE = "marche_attribue"
    CONTRAT_SIGNE = "contrat_signe"


class RecommandationCreate(BaseModel):
    trimestre: int = Field(ge=1, le=4)
    annee: int = Field(default=2025, ge=2025, le=2027)
    date_recommandation: date
    description: str = Field(min_length=1)
    responsable: str = Field(min_length=1, max_length=100)
    execution: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    observations: str | None = None


class RecommandationUpdate(BaseModel):
    trimestre: int | None = Field(default=None, ge=1, le=4)
    annee: int | None = Field(default=None, ge=2025, le=2027)
    date_recommandation: date | None = None
    description: str | None = Field(default=None, min_length=1)
    responsable: str | None = Field(default=None, min_length=1, max_length=100)
    execution: Decimal | None = Field(default=None, ge=0, le=100)
    observations: str | None = None


class RecommandationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trimestre: int
    annee: int
    date_recommandation: date
    description: str
    responsable: str
    execution: Decimal
    observations: str | None
    created_at: datetime
    updated_at: datetime


class MissionCreate(BaseModel):
    trimestre: int = Field(ge=1, le=4)
    annee: int = Field(default=2025, ge=2025, le=2027)
    date_mission: date
    description: str = Field(min_length=1)
    responsable: str = Field(min_length=1, max_length=100)
    execution: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    observations: str | None = None


class MissionUpdate(BaseModel):
    trimestre: int | None = Field(default=None, ge=1, le=4)
    annee: int | None = Field(default=None, ge=2025, le=2027)
    date_mission: date | None = None
    description: str | None = Field(default=None, min_length=1)
    responsable: str | None = Field(default=None, min_length=1, max_length=100)
    execution: Decimal | None = Field(default=None, ge=0, le=100)
    observations: str | None = None


class MissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trimestre: int
    annee: int
    date_mission: date
    description: str
    responsable: str
    execution: Decimal
    observations: str | None
    created_at: datetime
    updated_at: datetime


class PpmCreate(BaseModel):
    numero: str | None = Field(default=None, max_length=20)
    intitule: str = Field(min_length=1)
    type_marche: str | None = Field(default=None, max_length=50)
    mode_passation: str | None = Field(default=None, max_length=100)
    montant_estime: Decimal | None = Field(default=None, ge=0)
    montant_attribue: Decimal | None = Field(default=None, ge=0)
    financement: str | None = Field(default=None, max_length=50)
    date_marche: date | None = None
    statut: PpmStatut = PpmStatut.DAO_ELABORE
    observations: str | None = None


class PpmUpdate(BaseModel):
    numero: str | None = Field(default=None, max_length=20)
    intitule: str | None = Field(default=None, min_length=1)
    type_marche: str | None = Field(default=None, max_length=50)
    mode_passation: str | None = Field(default=None, max_length=100)
    montant_estime: Decimal | None = Field(default=None, ge=0)
    montant_attribue: Decimal | None = Field(default=None, ge=0)
    financement: str | None = Field(default=None, max_length=50)
    date_marche: date | None = None
    statut: PpmStatut | None = None
    observations: str | None = None


class PpmRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    numero: str | None
    intitule: str
    type_marche: str | None
    mode_passation: str | None
    montant_estime: Decimal | None
    montant_attribue: Decimal | None
    financement: str | None
    date_marche: date | None
    statut: PpmStatut
    observations: str | None
    created_at: datetime
    updated_at: datetime


class ProjetCreate(BaseModel):
    description: str = Field(min_length=1, description="Nom du projet")


class ProjetUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1)
    abreviation: str | None = Field(default=None, max_length=20)
    cout: Decimal | None = Field(default=None, ge=0)
    bailleur: str | None = Field(default=None, max_length=50)
    part_etat: Decimal | None = Field(default=None, ge=0, le=100)
    part_bailleur: Decimal | None = Field(default=None, ge=0, le=100)
    execution_financiere: Decimal | None = Field(default=None, ge=0, le=100)
    execution_physique: Decimal | None = Field(default=None, ge=0, le=100)
    date_debut: date | None = None
    date_fin: date | None = None
    observations: str | None = None


class ProjetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    description: str
    abreviation: str | None
    cout: Decimal | None
    bailleur: str | None
    part_etat: Decimal | None
    part_bailleur: Decimal | None
    execution_financiere: Decimal
    execution_physique: Decimal
    date_debut: date | None
    date_fin: date | None
    observations: str | None
    created_at: datetime
    updated_at: datetime


class IndicateurCreate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    libelle: str = Field(min_length=1)
    reference: str | None = Field(default=None, max_length=100)
    cible: Decimal | None = None
    realise: Decimal = Field(default=Decimal("0"), ge=0)


class IndicateurUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20)
    libelle: str | None = Field(default=None, min_length=1)
    reference: str | None = Field(default=None, max_length=100)
    cible: Decimal | None = None
    realise: Decimal | None = Field(default=None, ge=0)


class IndicateurRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    libelle: str
    reference: str | None
    cible: Decimal | None
    realise: Decimal
    created_at: datetime
    updated_at: datetime


class ModuleListResponse(BaseModel):
    items: list
    avg_execution: Decimal | None = None
