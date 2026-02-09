from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.crud_user import user as crud_user
from app.models.user import User as UserModel
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate

router = APIRouter()


@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> List[UserSchema]:
    """
    Retrieve users.
    """
    users = crud_user.get_multi(db, skip=skip, limit=limit)
    return users


@router.post(
    "/",
    response_model=UserSchema,
    status_code=201,
    responses={400: {"description": "The user with this username already exists in the system."}},
)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> UserSchema:
    """
    Create new user.
    """
    user = crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud_user.create(db, obj_in=user_in)
    return user


@router.put(
    "/{user_id}",
    response_model=UserSchema,
    responses={404: {"description": "The user with this username does not exist in the system"}},
)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
) -> UserSchema:
    """
    Update a user.
    """
    user = crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    user = crud_user.update(db, db_obj=user, obj_in=user_in)
    return user


@router.get(
    "/{user_id}",
    response_model=UserSchema,
    responses={404: {"description": "The user with this username does not exist in the system"}},
)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
) -> UserSchema:
    """
    Get a specific user by id.
    """
    user = crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    return user


@router.delete(
    "/{user_id}",
    response_model=UserSchema,
    responses={404: {"description": "The user with this username does not exist in the system"}},
)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
) -> UserSchema:
    """
    Delete a user.
    """
    user = crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    user = crud_user.remove(db, id=user_id)
    return user
