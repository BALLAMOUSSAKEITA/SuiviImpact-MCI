import enum
import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenType(str, enum.Enum):
    ACCESS = "access"
    REFRESH = "refresh"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, extra: dict | None = None) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": subject,
        "exp": expire,
        "type": TokenType.ACCESS.value,
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> tuple[str, datetime]:
    expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": subject,
        "exp": expire,
        "type": TokenType.REFRESH.value,
        "jti": secrets.token_urlsafe(16),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expire


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def is_token_valid(payload: dict, expected_type: TokenType) -> bool:
    try:
        if payload.get("type") != expected_type.value:
            return False
        return True
    except JWTError:
        return False
