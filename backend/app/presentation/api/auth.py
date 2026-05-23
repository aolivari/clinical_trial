from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.infrastructure.database import get_db
from app.core.logging import get_logger
from app.core.security import create_access_token, verify_password
from app.application.auth import (
    create_refresh_token,
    get_active_refresh_token,
    get_user_by_email,
    get_user_by_id,
    revoke_refresh_token,
)
from app.domain import LoginRequest, LoginResponse, TokenRefreshRequest, TokenRefreshResponse

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

_ACCESS_TOKEN_EXPIRE_MINUTES = 15


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, session: Session = Depends(get_db)):
    """Authenticate researcher, persist session, and return access & refresh tokens."""
    user = get_user_by_email(session, payload.email)

    if not user or not verify_password(payload.password, user.hashed_password):
        logger.warning("Failed login attempt for email '%s'", payload.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use researcher@clintrack.com and password123.",
        )

    if not user.is_active:
        logger.warning("Login attempt on deactivated account '%s'", payload.email)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    # Generate Access Token (JWT) — 15 minutes validity
    token_payload = {"sub": user.email, "role": user.role, "username": user.username}
    access_token = create_access_token(
        data=token_payload,
        expires_delta=timedelta(minutes=_ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    # Generate and persist Refresh Token — 7 days validity
    _, refresh_token_val = create_refresh_token(session, user.user_id)

    logger.info("User '%s' logged in successfully", user.email)
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token_val,
        token_type="bearer",
        username=user.username,
        role=user.role,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
def refresh_token(payload: TokenRefreshRequest, session: Session = Depends(get_db)):
    """Validate refresh token and issue a new access token and a rotated refresh token."""
    db_token = get_active_refresh_token(session, payload.refresh_token)

    if not db_token:
        logger.warning("Refresh attempt with invalid or revoked token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token.",
        )

    # Timezone-aware expiration check
    from datetime import datetime, timezone

    expires_at = db_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        logger.warning("Refresh attempt with expired token for user_id '%s'", db_token.user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please log in again.",
        )

    user = get_user_by_id(session, db_token.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token is invalid or deactivated.",
        )

    # Revoke old token and issue rotated pair in one commit
    revoke_refresh_token(session, db_token)
    _, new_refresh_token_val = create_refresh_token(session, user.user_id)

    logger.info("Refresh token rotated for user '%s'", user.email)
    token_payload = {"sub": user.email, "role": user.role, "username": user.username}
    new_access_token = create_access_token(
        data=token_payload,
        expires_delta=timedelta(minutes=_ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return TokenRefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token_val,
        token_type="bearer",
    )
