from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.core.roles import normalize_role_for_create
from app.schemas.auth import UserCreate, UserCreateResponse, UserRead, user_to_read
from app.core.passwords import generate_temporary_password

router = APIRouter(prefix="/users")


@router.get("", response_model=list[UserRead])
async def list_users(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[UserRead]:
    result = await db.execute(select(User).order_by(User.id))
    return [user_to_read(u) for u in result.scalars().all()]


@router.post("", response_model=UserCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> UserCreateResponse:
    existing = await db.execute(select(User).where(User.username == body.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà utilisé")

    type_acces = normalize_role_for_create(body.role, body.type_acces)

    generated: str | None = None
    plain_password = body.password
    if not plain_password:
        plain_password = generate_temporary_password()
        generated = plain_password

    user = User(
        username=body.username,
        password_hash=hash_password(plain_password),
        prenom=body.prenom.strip(),
        nom=body.nom.strip(),
        type_acces=type_acces,
        role=body.role,
        etat=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserCreateResponse(user=user_to_read(user), generated_password=generated)


@router.patch("/{user_id}/activate", response_model=UserRead)
async def activate_user(
    user_id: int,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    user = await _get_user_or_404(db, user_id)
    user.etat = True
    await db.commit()
    await db.refresh(user)
    return user_to_read(user)


@router.patch("/{user_id}/deactivate", response_model=UserRead)
async def deactivate_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Impossible de désactiver votre propre compte")
    user = await _get_user_or_404(db, user_id)
    user.etat = False
    await db.commit()
    await db.refresh(user)
    return user_to_read(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> None:
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Impossible de supprimer votre propre compte")
    user = await _get_user_or_404(db, user_id)
    await db.delete(user)
    await db.commit()


async def _get_user_or_404(db: AsyncSession, user_id: int) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user
