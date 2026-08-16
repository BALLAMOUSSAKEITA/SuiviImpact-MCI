from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PersonnelCabinetBase(BaseModel):
    num_ordre: int = Field(ge=1, le=9999)
    nom_complet: str = Field(min_length=1, max_length=200)
    fonction: str = Field(min_length=1, max_length=500)
    contact: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    categorie: str = Field(default="", max_length=100)
    code_presence: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")

    @field_validator("code_presence")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip()


class PersonnelCabinetCreate(BaseModel):
    num_ordre: int = Field(ge=1, le=9999)
    nom_complet: str = Field(min_length=1, max_length=200)
    fonction: str = Field(min_length=1, max_length=500)
    contact: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    categorie: str = Field(default="", max_length=100)
    code_presence: str | None = Field(
        default=None, min_length=4, max_length=4, pattern=r"^\d{4}$"
    )

    @field_validator("code_presence")
    @classmethod
    def normalize_code(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()


class PersonnelCabinetUpdate(BaseModel):
    num_ordre: int | None = Field(default=None, ge=1, le=9999)
    nom_complet: str | None = Field(default=None, min_length=1, max_length=200)
    fonction: str | None = Field(default=None, min_length=1, max_length=500)
    contact: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    categorie: str | None = Field(default=None, max_length=100)
    code_presence: str | None = Field(default=None, min_length=4, max_length=4, pattern=r"^\d{4}$")
    actif: bool | None = None

    @field_validator("code_presence")
    @classmethod
    def normalize_code(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip()


class PersonnelCabinetRead(BaseModel):
    """Lecture API — autorise les lignes placeholder (nom/fonction vides, n° 13–14…)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    num_ordre: int = Field(ge=1, le=9999)
    nom_complet: str = Field(max_length=200)
    fonction: str = Field(max_length=500)
    contact: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    categorie: str = Field(default="", max_length=100)
    code_presence: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")
    actif: bool
    created_at: datetime
    updated_at: datetime

    @field_validator("code_presence")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip()


class SeancePresenceCreate(BaseModel):
    titre: str = Field(min_length=1, max_length=255)
    date_seance: date


class SeancePresenceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titre: str
    date_seance: date
    token: str
    statut: str
    created_at: datetime
    closed_at: datetime | None
    nb_presents: int = 0
    nb_personnel_actif: int = 0


class PresenceEnregistrementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    personnel_id: int
    nom_complet: str
    fonction: str
    categorie: str
    contact: str | None
    email: str | None
    pointe_a: datetime


class SeancePresenceDetail(SeancePresenceRead):
    presences: list[PresenceEnregistrementRead] = []


class PublicSeanceInfo(BaseModel):
    titre: str
    date_seance: date
    statut: str


class CheckInRequest(BaseModel):
    code: str = Field(min_length=4, max_length=4, pattern=r"^\d{4}$")

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        return value.strip()


class CheckInResponse(BaseModel):
    success: bool
    message: str
    nom_complet: str | None = None
    fonction: str | None = None
    pointe_a: datetime | None = None
    deja_pointe: bool = False
