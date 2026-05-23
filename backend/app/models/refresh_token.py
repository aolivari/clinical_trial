from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"

    token_id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    token: str = Field(index=True, unique=True, nullable=False)
    user_id: UUID = Field(foreign_key="users.user_id", nullable=False)
    expires_at: datetime = Field(nullable=False)
    is_revoked: bool = Field(default=False, nullable=False)
