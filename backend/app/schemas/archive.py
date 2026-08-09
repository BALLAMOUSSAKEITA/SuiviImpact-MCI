from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DossierCreate(BaseModel):
    nom: str = Field(min_length=1, max_length=255)
    parent_id: int | None = None


class DossierRename(BaseModel):
    nom: str = Field(min_length=1, max_length=255)


class DossierRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom: str
    parent_id: int | None
    created_at: datetime
    updated_at: datetime


class FichierArchiveRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom: str
    dossier_id: int | None
    mime_type: str | None
    taille: int
    created_at: datetime


class BreadcrumbItem(BaseModel):
    id: int
    nom: str


class ArchiveRootRead(BaseModel):
    dossiers: list[DossierRead]
    fichiers: list[FichierArchiveRead]


class DossierContentRead(BaseModel):
    dossier: DossierRead
    breadcrumb: list[BreadcrumbItem]
    sous_dossiers: list[DossierRead]
    fichiers: list[FichierArchiveRead]


class DossierDeletePreview(BaseModel):
    nom: str
    est_vide: bool
    sous_dossiers_directs: int
    sous_dossiers_total: int
    fichiers_directs: int
    fichiers_total: int
