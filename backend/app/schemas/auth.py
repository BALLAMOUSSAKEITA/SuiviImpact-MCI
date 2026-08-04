from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class AccessType(str, Enum):
    LECTURE = "lecture"
    ECRITURE = "ecriture"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


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
    password: str = Field(min_length=6)
    prenom: str = Field(min_length=1, max_length=100)
    type_acces: AccessType = AccessType.LECTURE
    role: UserRole = UserRole.USER


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    prenom: str
    role: UserRole
    type_acces: AccessType
    etat: bool
    created_at: datetime
    updated_at: datetime


class UserMe(UserRead):
    pass
