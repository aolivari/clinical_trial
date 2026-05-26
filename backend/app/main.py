import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.infrastructure.database import init_db, get_db, engine
from app.core.logging import configure_logging, get_logger
from app.infrastructure import Participant
from app.infrastructure.seed import seed_database
from app.presentation.api import auth_router, participants_router, metrics_router

# Configure structured logging before anything else
configure_logging()
logger = get_logger(__name__)

from app.core.limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle handler."""
    logger.info("Initializing database...")
    init_db()

    with Session(engine) as session:
        seed_database(session)

    yield


app = FastAPI(
    title="Clinical Trial Participant API",
    description="Backend API for managing clinical trial participants and dashboard data",
    version="1.0.0",
    lifespan=lifespan,
)

# Attach limiter state to the app (required by slowapi)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS (Cross-Origin Resource Sharing) — restricted to known methods & headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
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
    logger.error("Global exception caught on request %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

@app.exception_handler(status.HTTP_404_NOT_FOUND)
async def not_found_exception_handler(request: Request, exc: Exception):
    logger.warning("HTTP 404 exception on request %s", request.url.path)
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "The requested resource was not found."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error on request %s: %s", request.url.path, exc.errors())
    errors = [f"Campo '{err['loc'][-1]}': {err['msg']}" for err in exc.errors()]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Error de validación", "errors": errors}
    )

@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    logger.error("Database integrity error on request %s: %s", request.url.path, exc)
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
        logger.error("Health check database error: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": "disconnected", "detail": str(e)}
        )

# Register Routers
app.include_router(auth_router)
app.include_router(participants_router)
app.include_router(metrics_router)
