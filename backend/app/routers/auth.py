import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models import User, RefreshToken
from app.schemas import LoginRequest, LoginResponse, TokenRefreshRequest, TokenRefreshResponse

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, session: Session = Depends(get_db)):
    """Authenticate researcher, persist session, and return access & refresh tokens."""
    # Find user by email
    statement = select(User).where(User.email == payload.email)
    user = session.exec(statement).first()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use researcher@clintrack.com and password123."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )
    
    # Generate Access Token (JWT) - 15 minutes validity
    token_payload = {
        "sub": user.email,
        "role": user.role,
        "username": user.username
    }
    access_token = create_access_token(data=token_payload, expires_delta=timedelta(minutes=15))
    
    # Generate Refresh Token (secure random hex string) - 7 days validity
    refresh_token_val = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    db_refresh_token = RefreshToken(
        token=refresh_token_val,
        user_id=user.user_id,
        expires_at=expires_at
    )
    session.add(db_refresh_token)
    session.commit()
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token_val,
        token_type="bearer",
        username=user.username,
        role=user.role
    )

@router.post("/refresh", response_model=TokenRefreshResponse)
def refresh_token(payload: TokenRefreshRequest, session: Session = Depends(get_db)):
    """Validate refresh token and issue a new access token and a rotated refresh token."""
    # Query active refresh token
    statement = select(RefreshToken).where(
        RefreshToken.token == payload.refresh_token,
        RefreshToken.is_revoked == False
    )
    db_refresh_token = session.exec(statement).first()
    
    if not db_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token."
        )
    
    # Check expiration (aware comparison in UTC)
    # Ensure database datetime is compared correctly
    db_expires_at = db_refresh_token.expires_at
    if db_expires_at.tzinfo is None:
        db_expires_at = db_expires_at.replace(tzinfo=timezone.utc)
        
    if db_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please log in again."
        )
        
    # Get associated user
    user = session.get(User, db_refresh_token.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token is invalid or deactivated."
        )
        
    # Revoke old refresh token (Token rotation)
    db_refresh_token.is_revoked = True
    session.add(db_refresh_token)
    
    # Generate new Access Token - 15 minutes validity
    token_payload = {
        "sub": user.email,
        "role": user.role,
        "username": user.username
    }
    new_access_token = create_access_token(data=token_payload, expires_delta=timedelta(minutes=15))
    
    # Generate rotated Refresh Token - 7 days validity
    new_refresh_token_val = secrets.token_hex(32)
    new_expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    new_db_refresh_token = RefreshToken(
        token=new_refresh_token_val,
        user_id=user.user_id,
        expires_at=new_expires_at
    )
    session.add(new_db_refresh_token)
    session.commit()
    
    return TokenRefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token_val,
        token_type="bearer"
    )
