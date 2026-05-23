import jwt
from fastapi import APIRouter, HTTPException, status
from app.schemas import LoginRequest, LoginResponse
from app.core.config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    """Authenticate researcher and return JWT token."""
    if payload.email == "researcher@clintrack.com" and payload.password == "password123":
        token_payload = {
            "sub": payload.email,
            "role": "Lead Investigator",
            "username": "Dr. Aris Thorne"
        }
        access_token = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            username="Dr. Aris Thorne",
            role="Lead Investigator"
        )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Use researcher@clintrack.com and password123."
    )
