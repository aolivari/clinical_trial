"""
Metrics aggregation queries.

Computes trial-level KPIs by running aggregate SQL queries against the
participants table.  All computations happen in the database layer for
efficiency — using CASE WHEN expressions to aggregate in a single round-trip.
"""
from sqlalchemy import case, func
from sqlmodel import Session, select

from app.infrastructure import Participant
from app.domain.metrics import MetricsResponse


def compute_metrics(session: Session) -> MetricsResponse:
    """Build a MetricsResponse from live participant data using optimised aggregations."""

    # Single aggregation query using CASE WHEN — replaces 8 individual queries
    statement = select(
        func.count(Participant.participant_id).label("total"),
        # Status breakdown
        func.count(case((Participant.status == "active", 1))).label("active"),
        func.count(case((Participant.status == "completed", 1))).label("completed"),
        func.count(case((Participant.status == "withdrawn", 1))).label("withdrawn"),
        # Study group breakdown
        func.count(case((Participant.study_group == "treatment", 1))).label("treatment"),
        func.count(case((Participant.study_group == "control", 1))).label("control"),
        # Gender breakdown
        func.count(case((Participant.gender == "M", 1))).label("male"),
        func.count(case((Participant.gender == "F", 1))).label("female"),
        func.count(case((Participant.gender == "Other", 1))).label("other_gender"),
        # Age average
        func.avg(Participant.age).label("avg_age"),
    )

    row = session.exec(statement).one()

    total: int = row.total  # type: ignore[union-attr]
    if total == 0:
        return MetricsResponse(
            total_participants=0,
            active_count=0,
            completed_count=0,
            withdrawn_count=0,
            treatment_count=0,
            control_count=0,
            male_count=0,
            female_count=0,
            other_gender_count=0,
            retention_rate=0.0,
            completion_rate=0.0,
            avg_age=0.0,
        )

    active: int = row.active  # type: ignore[union-attr]
    completed: int = row.completed  # type: ignore[union-attr]
    withdrawn: int = row.withdrawn  # type: ignore[union-attr]
    treatment: int = row.treatment  # type: ignore[union-attr]
    control: int = row.control  # type: ignore[union-attr]
    male: int = row.male  # type: ignore[union-attr]
    female: int = row.female  # type: ignore[union-attr]
    other_gender: int = row.other_gender  # type: ignore[union-attr]
    avg_age_val: float = row.avg_age or 0.0  # type: ignore[union-attr]

    # Derived percentages
    retention_rate = round(((total - withdrawn) / total) * 100, 1)
    completion_rate = round((completed / total) * 100, 1)

    return MetricsResponse(
        total_participants=total,
        active_count=active,
        completed_count=completed,
        withdrawn_count=withdrawn,
        treatment_count=treatment,
        control_count=control,
        male_count=male,
        female_count=female,
        other_gender_count=other_gender,
        retention_rate=retention_rate,
        completion_rate=completion_rate,
        avg_age=round(avg_age_val, 1),
    )
