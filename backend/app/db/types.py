import enum
from typing import TypeVar

from sqlalchemy import Enum

E = TypeVar("E", bound=enum.Enum)


def pg_enum(enum_class: type[E], name: str) -> Enum:
    """PostgreSQL ENUM persistant avec les valeurs Python (pas les noms)."""
    return Enum(
        enum_class,
        name=name,
        values_callable=lambda members: [member.value for member in members],
    )
