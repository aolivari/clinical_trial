import time
from contextlib import asynccontextmanager
from datetime import date
from uuid import uuid4
from fastapi import FastAPI, Depends, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.infrastructure.database import init_db, get_db, engine
from app.core.logging import configure_logging, get_logger
from app.infrastructure import Participant, User
from app.core.security import hash_password
from app.presentation.api import auth_router, participants_router, metrics_router

# Configure structured logging before anything else
configure_logging()
logger = get_logger(__name__)

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
            
        # Seed database with mock researcher user if empty
        statement_users = select(User)
        existing_users = session.exec(statement_users).all()
        if not existing_users:
            logger.info("Users database is empty. Seeding default researcher user...")
            default_user = User(
                user_id=uuid4(),
                email="researcher@clintrack.com",
                hashed_password=hash_password("password123"),
                username="Dr. Aris Thorne",
                role="Lead Investigator"
            )
            session.add(default_user)
            session.commit()
            logger.info("Default researcher user seeding completed.")
        else:
            logger.info(f"Users database contains {len(existing_users)} users.")
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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# HTTP Request Logging Middleware
# Logs: METHOD /path → status_code (elapsed ms)
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s → %d (%.1f ms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response

# Global Error Handling Middleware
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught on request {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

@app.exception_handler(status.HTTP_404_NOT_FOUND)
async def not_found_exception_handler(request: Request, exc: Exception):
    logger.warning(f"HTTP 404 exception on request {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": f"The requested resource was not found."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on request {request.url.path}: {exc.errors()}")
    errors = [f"Campo '{err['loc'][-1]}': {err['msg']}" for err in exc.errors()]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Error de validación", "errors": errors}
    )

@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    logger.error(f"Database integrity error on request {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Database integrity violation (possible duplicate key or constraint violation)."}
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

# Register Routers
app.include_router(auth_router)
app.include_router(participants_router)
app.include_router(metrics_router)
