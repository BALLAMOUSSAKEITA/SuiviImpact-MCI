from decimal import Decimal

from pydantic import BaseModel


class ActiviteStats(BaseModel):
    total: int
    non_demare: int
    en_cours: int
    termine: int
    en_retard: int
    progression: Decimal


class ExecutionStats(BaseModel):
    total: int
    non_demare: int
    en_cours: int
    termine: int
    progression: Decimal


class PpmStats(BaseModel):
    total: int
    dao_elabore: int
    dao_publie: int
    marche_attribue: int
    contrat_signe: int


class ProjetStats(BaseModel):
    total: int
    execution_financiere: Decimal
    execution_physique: Decimal
