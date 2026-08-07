"""Paramétrage — ministre."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ministre import MINISTRE_PARAMETRAGE_ID, MinistreParametrage
from app.schemas.parametrage import MinistreParametrageRead, MinistreParametrageUpdate


async def _ensure_ministre_row(db: AsyncSession) -> MinistreParametrage:
    row = await db.get(MinstreParametrage, MINISTRE_PARAMETRAGE_ID)
    if row is None:
        row = MinistreParametrage(
            id=MINISTRE_PARAMETRAGE_ID,
            prenom="",
            nom="",
            email=None,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


async def get_ministre_parametrage(db: AsyncSession) -> MinistreParametrageRead:
    row = await _ensure_ministre_row(db)
    return MinistreParametrageRead.model_validate(row)


async def update_ministre_parametrage(
    db: AsyncSession, data: MinistreParametrageUpdate
) -> MinistreParametrageRead:
    row = await _ensure_ministre_row(db)
    row.prenom = data.prenom.strip()
    row.nom = data.nom.strip()
    row.email = data.email.strip()
    await db.commit()
    await db.refresh(row)
    return MinistreParametrageRead.model_validate(row)
