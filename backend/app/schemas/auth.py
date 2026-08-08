from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AccessType(str, Enum):
    LECTURE = "lecture"
    ECRITURE = "ecriture"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    DIRECTEUR = "directeur"
    SG = "sg"
    MINISTRE = "ministre"
    DAF = "daf"


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str | None = None
    prenom: str = Field(min_length=1, max_length=100)
    nom: str = Field(default="", max_length=100)
    type_acces: AccessType = AccessType.LECTURE
    role: UserRole = UserRole.USER

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: str | None) -> str | None:
        if value is not None and len(value) < 6:
            raise ValueError("Le mot de passe doit contenir au moins 6 caractères")
        return value


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    prenom: str
    nom: str
    role: UserRole
    type_acces: AccessType
    etat: bool
    has_avatar: bool = False
    created_at: datetime
    updated_at: datetime


class UserCreateResponse(BaseModel):
    user: UserRead
    generated_password: str | None = None


class UserMe(UserRead):
    pass


class ProfileUpdate(BaseModel):
    prenom: str = Field(min_length=1, max_length=100)
    nom: str = Field(min_length=1, max_length=100)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6, max_length=128)


def user_to_read(user) -> UserRead:
    return UserRead(
        id=user.id,
        username=user.username,
        prenom=user.prenom,
        nom=user.nom or "",
        role=user.role,
        type_acces=user.type_acces,
        etat=user.etat,
        has_avatar=bool(user.avatar_path),
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
