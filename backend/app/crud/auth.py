"""
CRUD operations for authentication-related models (User, RefreshToken).

All direct database interaction for auth lives here.
Routers call these functions and handle HTTP-level concerns (exceptions, status codes).
"""
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlmodel import Session, select

from app.models import RefreshToken, User

# ---------------------------------------------------------------------------
# User queries
# ---------------------------------------------------------------------------


def get_user_by_email(session: Session, email: str) -> User | None:
    """Return the user matching the given email address, or None."""
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: UUID) -> User | None:
    """Return the user matching the given UUID, or None."""
    return session.get(User, user_id)


# ---------------------------------------------------------------------------
# Refresh Token operations
# ---------------------------------------------------------------------------


def get_active_refresh_token(session: Session, token: str) -> RefreshToken | None:
    """
    Return the RefreshToken row matching the given token string only if it
    has not been revoked. Returns None otherwise.
    """
    statement = select(RefreshToken).where(
        RefreshToken.token == token,
        RefreshToken.is_revoked == False,  # noqa: E712
    )
    return session.exec(statement).first()


def create_refresh_token(
    session: Session,
    user_id: UUID,
    *,
    expires_days: int = 7,
) -> tuple[RefreshToken, str]:
    """
    Generate a cryptographically secure refresh token, persist it, and
    return both the ORM object and the raw token string.

    Usage::

        db_token, raw_value = create_refresh_token(session, user.user_id)
        return {"refresh_token": raw_value, ...}
    """
    raw_token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_days)
    db_token = RefreshToken(
        token=raw_token,
        user_id=user_id,
        expires_at=expires_at,
    )
    session.add(db_token)
    session.commit()
    return db_token, raw_token


def revoke_refresh_token(session: Session, db_token: RefreshToken) -> None:
    """Mark a refresh token as revoked (does NOT commit — caller must commit)."""
    db_token.is_revoked = True
    session.add(db_token)
