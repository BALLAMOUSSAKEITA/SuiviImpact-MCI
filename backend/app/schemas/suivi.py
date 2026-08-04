from decimal import Decimal

from pydantic import BaseModel

from app.schemas.planification import TacheRead


class SuiviActiviteRead(BaseModel):
    id: int
    code: str
    description: str
    execution: Decimal
    budget: Decimal
    objectif_id: int
    direction_ids: list[int]
    nb_taches: int = 0
    nb_terminees: int = 0
    nb_en_retard: int = 0


class TacheDetailsRead(TacheRead):
    activite_code: str
    activite_description: str
