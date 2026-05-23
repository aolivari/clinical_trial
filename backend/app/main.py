import logging
from contextlib import asynccontextmanager
from datetime import date
from uuid import UUID, uuid4
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlmodel import Session, select

from app.database import init_db, get_db, engine
from app.models import Participant
from app.schemas import ParticipantCreate, ParticipantResponse, ParticipantUpdate, LoginRequest, LoginResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clinical_trial_api")

# JWT Configuration
SECRET_KEY = "clintrack_super_secret_session_key_for_trial_phases"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract and validate JWT token from Bearer Auth header."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError as e:
        logger.warning(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token or session expired."
        )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database
    logger.info("Initializing database...")
    init_db()
    
    # Seed database with mock clinical trial participants if empty
    with Session(engine) as session:
        statement = select(Participant)
        existing = session.exec(statement).all()
        if not existing:
            logger.info("Database is empty. Seeding mock participant data...")
            mock_participants = [
                Participant(
                    participant_id=uuid4(),
                    subject_id="P001",
                    study_group="treatment",
                    enrollment_date=date(2023, 10, 12),
                    status="active",
                    age=42,
                    gender="M"
                ),
                Participant(
                    participant_id=uuid4(),
                    subject_id="P002",
                    study_group="control",
                    enrollment_date=date(2023, 10, 14),
                    status="completed",
                    age=29,
                    gender="F"
                ),
                Participant(
                    participant_id=uuid4(),
                    subject_id="P003",
                    study_group="treatment",
                    enrollment_date=date(2023, 10, 15),
                    status="active",
                    age=51,
                    gender="M"
                ),
                Participant(
                    participant_id=uuid4(),
                    subject_id="P004",
                    study_group="control",
                    enrollment_date=date(2023, 10, 18),
                    status="withdrawn",
                    age=38,
                    gender="F"
                ),
                Participant(
                    participant_id=uuid4(),
                    subject_id="P005",
                    study_group="treatment",
                    enrollment_date=date(2023, 10, 20),
                    status="active",
                    age=64,
                    gender="M"
                ),
                Participant(
                    participant_id=uuid4(),
                    subject_id="P006",
                    study_group="control",
                    enrollment_date=date(2023, 10, 21),
                    status="active",
                    age=45,
                    gender="F"
                )
            ]
            for p in mock_participants:
                session.add(p)
            session.commit()
            logger.info("Mock participant seeding completed successfully.")
        else:
            logger.info(f"Database already contains {len(existing)} participants.")
    yield

app = FastAPI(
    title="Clinical Trial Participant API",
    description="Backend API for managing clinical trial participants and dashboard data",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Error Handling Middleware
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught on request {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP exception on request {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Health endpoint
@app.get("/health", tags=["System"])
async def health_check(session: Session = Depends(get_db)):
    try:
        session.exec(select(Participant).limit(1))
        return {
            "status": "ok",
            "database": "connected",
            "message": "Clinical Trial API is healthy and operational"
        }
    except Exception as e:
        logger.error(f"Health check database error: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": "disconnected", "detail": str(e)}
        )

# --- Authentication Endpoint ---

@app.post("/api/v1/auth/login", response_model=LoginResponse, tags=["Authentication"])
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

# --- Participant Endpoints (CRUD - Secured with JWT) ---

@app.get("/api/v1/participants", response_model=list[ParticipantResponse], tags=["Participants"])
def get_participants(
    session: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Fetch all clinical trial participants. Requires authorization."""
    statement = select(Participant)
    results = session.exec(statement).all()
    return results

@app.get("/api/v1/participants/{participant_id}", response_model=ParticipantResponse, tags=["Participants"])
def get_participant(
    participant_id: UUID, 
    session: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Fetch a single participant by UUID. Requires authorization."""
    participant = session.get(Participant, participant_id)
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found"
        )
    return participant

@app.post("/api/v1/participants", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED, tags=["Participants"])
def create_participant(
    participant_in: ParticipantCreate, 
    session: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Register a new clinical trial participant. Requires authorization."""
    # Check if subject_id already exists
    statement = select(Participant).where(Participant.subject_id == participant_in.subject_id)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Participant with Subject ID {participant_in.subject_id} already exists"
        )
    
    db_participant = Participant(
        subject_id=participant_in.subject_id,
        study_group=participant_in.study_group.value.lower(),
        enrollment_date=participant_in.enrollment_date,
        status=participant_in.status.value.lower(),
        age=participant_in.age,
        gender=participant_in.gender.value
    )
    session.add(db_participant)
    session.commit()
    session.refresh(db_participant)
    return db_participant

@app.put("/api/v1/participants/{participant_id}", response_model=ParticipantResponse, tags=["Participants"])
def update_participant(
    participant_id: UUID, 
    participant_in: ParticipantUpdate, 
    session: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update properties of an existing participant. Requires authorization."""
    db_participant = session.get(Participant, participant_id)
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found"
        )
    
    update_data = participant_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in ["study_group", "status", "gender"] and value is not None:
            setattr(db_participant, key, value.value)
        else:
            setattr(db_participant, key, value)
        
    session.add(db_participant)
    session.commit()
    session.refresh(db_participant)
    return db_participant

@app.delete("/api/v1/participants/{participant_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Participants"])
def delete_participant(
    participant_id: UUID, 
    session: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a participant by ID. Requires authorization."""
    db_participant = session.get(Participant, participant_id)
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found"
        )
    session.delete(db_participant)
    session.commit()
    return None
