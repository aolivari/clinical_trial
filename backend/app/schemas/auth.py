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
