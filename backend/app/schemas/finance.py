from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class FinanceLigneRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ordre: int
    titre_budget: str
    montant_prevu: Decimal | None
    montant_engage: Decimal | None
    montant_paye: Decimal | None
    taux_engagement: Decimal | None
    taux_caisse: Decimal | None
    source_information: str | None
    is_total: bool


class FinanceSnapshotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    filename: str
    imported_at: datetime
    imported_by_user_id: int | None
    row_count: int


class FinanceStateRead(BaseModel):
    snapshot: FinanceSnapshotRead | None
    lignes: list[FinanceLigneRead]
