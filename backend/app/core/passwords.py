import secrets
import string

_ALPHABET = string.ascii_letters + string.digits


def generate_temporary_password(length: int = 12) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(length))
