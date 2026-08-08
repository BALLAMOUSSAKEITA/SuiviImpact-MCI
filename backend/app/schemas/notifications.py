from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationEmailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    activite_id: int | None
    activite_code: str | None = None
    activite_description: str | None = None
    destinataire: str
    sujet: str | None
    en_copie: bool
    envoye_at: datetime
    statut: str


class RappelActivitesStats(BaseModel):
    activites_notifiees: int
    emails_envoyes: int
    emails_simules: int
    emails_echec: int
