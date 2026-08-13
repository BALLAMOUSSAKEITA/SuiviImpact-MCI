"""Paramétrage — ministre et secrétaire général."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ministre import MINISTRE_PARAMETRAGE_ID, MinistreParametrage
from app.models.sg import SG_PARAMETRAGE_ID, SgParametrage
from app.schemas.parametrage import (
    MinistreParametrageRead,
    MinistreParametrageUpdate,
    SgParametrageRead,
    SgParametrageUpdate,
)


async def _ensure_ministre_row(db: AsyncSession) -> MinistreParametrage:
    row = await db.get(MinistreParametrage, MINISTRE_PARAMETRAGE_ID)
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


async def _ensure_sg_row(db: AsyncSession) -> SgParametrage:
    row = await db.get(SgParametrage, SG_PARAMETRAGE_ID)
    if row is None:
        row = SgParametrage(
            id=SG_PARAMETRAGE_ID,
            prenom="",
            nom="",
            email=None,
            email_2=None,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


async def get_sg_parametrage(db: AsyncSession) -> SgParametrageRead:
    row = await _ensure_sg_row(db)
    return SgParametrageRead.model_validate(row)


async def update_sg_parametrage(
    db: AsyncSession, data: SgParametrageUpdate
) -> SgParametrageRead:
    row = await _ensure_sg_row(db)
    row.prenom = data.prenom.strip()
    row.nom = data.nom.strip()
    row.email = data.email.strip()
    row.email_2 = data.email_2.strip()
    await db.commit()
    await db.refresh(row)
    return SgParametrageRead.model_validate(row)
