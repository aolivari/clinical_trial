from pydantic import BaseModel, Field, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["researcher@clintrack.com"])
    password: str = Field(..., examples=["password123"])

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str
