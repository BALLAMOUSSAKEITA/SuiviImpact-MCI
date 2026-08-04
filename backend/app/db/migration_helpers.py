"""Helpers for idempotent Alembic migrations on PostgreSQL."""

from alembic import op


def ensure_enum(name: str, *values: str) -> None:
    """Create a PostgreSQL ENUM type if it does not already exist."""
    labels = ", ".join(f"'{value}'" for value in values)
    op.execute(
        f"""
        DO $$
        BEGIN
            CREATE TYPE {name} AS ENUM ({labels});
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )


def drop_enum(name: str) -> None:
    op.execute(f"DROP TYPE IF EXISTS {name}")
