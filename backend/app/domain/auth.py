from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["researcher@clintrack.com"])
    password: str = Field(..., examples=["password123"])


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    username: str
    role: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str = Field(..., examples=["some_random_refresh_token_string"])


class TokenRefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Typed representation of a decoded JWT access token payload."""
    sub: EmailStr = Field(..., description="User email (subject claim)")
    role: str = Field(..., description="User role")
    username: str = Field(..., description="Display name")
    exp: datetime = Field(..., description="Expiration timestamp")
