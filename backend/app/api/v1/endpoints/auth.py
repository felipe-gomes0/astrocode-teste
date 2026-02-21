from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.crud.crud_user import user as crud_user
from app.schemas.token import Token
from app.core.logging.log_service import LogService
from app.core.logging.log_dependency import get_log_service
from app.core.logging.log_schema import ActorContext

router = APIRouter()


@router.post("/access-token", response_model=Token)
async def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    log_service: LogService = Depends(get_log_service),
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    user = crud_user.authenticate(db, email=form_data.username, password=form_data.password)

    if not user:
        await log_service.audit(
            action="LOGIN_FAILED",
            message=f"Failed login attempt for email: {form_data.username}",
            category="auth",
            metadata={"email": form_data.username},
        )
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.active:
        await log_service.audit(
            action="LOGIN_FAILED_INACTIVE",
            message=f"Login attempt by inactive user: {form_data.username}",
            category="auth",
            actor=ActorContext(user_id=str(user.id), email=user.email, role=str(user.type)),
        )
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    await log_service.audit(
        action="LOGIN_SUCCESS",
        message=f"User logged in successfully",
        category="auth",
        actor=ActorContext(user_id=str(user.id), email=user.email, role=str(user.type)),
    )

    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
