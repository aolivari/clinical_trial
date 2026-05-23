from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.infrastructure.database import get_db
from app.core.logging import get_logger
from app.core.security import get_current_user
from app.application.metrics import compute_metrics
from app.domain.metrics import MetricsResponse

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/metrics",
    tags=["Metrics"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=MetricsResponse)
def get_metrics(session: Session = Depends(get_db)):
    """Return aggregated trial KPIs computed from live participant data. Requires authorization."""
    logger.info("Computing trial metrics from live data")
    return compute_metrics(session)
