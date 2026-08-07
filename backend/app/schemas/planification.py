from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


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


PAO_PONDERATIONS = {5, 15, 25, 45, 50, 60}


class PlanificationPaoTacheItem(BaseModel):
    tache_plan_id: int
    ponderation: Decimal = Field(gt=0, le=100)


class PlanificationPaoCreate(BaseModel):
    description: str = Field(min_length=1)
    objectif_id: int
    budget: Decimal = Field(default=Decimal("0"), ge=0)
    date_debut: date
    date_fin: date
    direction_id: int
    email_responsable: str = Field(min_length=3, max_length=255)
    email_ministre: str = Field(min_length=3, max_length=255)
    taches: list[PlanificationPaoTacheItem] = Field(default_factory=list, max_length=5)


class PlanificationPaoTacheRead(BaseModel):
    tache_plan_id: int
    tache_plan_code: str
    tache_plan_description: str
    ponderation: Decimal


class PlanificationPaoRead(BaseModel):
    id: int
    code: str
    description: str
    budget: Decimal
    objectif_id: int
    objectif_code: str
    objectif_description: str
    date_debut: date
    date_fin: date
    direction_id: int
    direction_code: str
    direction_libelle: str
    email_responsable: str
    email_ministre: str
    tdr_nom_original: str | None
    taches: list[PlanificationPaoTacheRead]
    created_at: datetime


class TypeBudgetProjet(str, Enum):
    BND = "BND"
    FINEX = "FINEX"


class PlanificationProjetActiviteCreate(BaseModel):
    titre: str = Field(min_length=1)


class PlanificationProjetComposanteCreate(BaseModel):
    libelle: str | None = Field(default=None, max_length=255)
    activites: list[PlanificationProjetActiviteCreate] = Field(
        default_factory=list, max_length=5
    )


class PlanificationProjetCreate(BaseModel):
    projet_id: int
    type_budget: TypeBudgetProjet
    composantes: list[PlanificationProjetComposanteCreate] = Field(
        default_factory=list, max_length=2
    )
    montant: Decimal = Field(ge=0)
    lieu: str = Field(min_length=1, max_length=255)
    date_debut: date
    date_fin: date
    direction_id: int
    email_responsable: str = Field(min_length=3, max_length=255)
    email_ministre: str = Field(min_length=3, max_length=255)

    @model_validator(mode="after")
    def validate_dates(self) -> "PlanificationProjetCreate":
        if self.date_fin < self.date_debut:
            raise ValueError("La date de fin doit être postérieure ou égale à la date de début")
        return self


class PlanificationProjetActiviteRead(BaseModel):
    id: int
    ordre: int
    titre: str


class PlanificationProjetComposanteRead(BaseModel):
    id: int
    ordre: int
    libelle: str | None
    activites: list[PlanificationProjetActiviteRead]


class PlanificationProjetRead(BaseModel):
    id: int
    projet_id: int
    projet_code: str
    projet_description: str
    type_budget: TypeBudgetProjet
    montant: Decimal
    lieu: str
    date_debut: date
    date_fin: date
    direction_id: int
    direction_code: str
    direction_libelle: str
    email_responsable: str
    email_ministre: str
    composantes: list[PlanificationProjetComposanteRead]
    created_at: datetime
