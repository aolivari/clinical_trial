"""
Metrics aggregation queries.

Computes trial-level KPIs by running aggregate SQL queries against the
participants table.  All computations happen in the database layer for
efficiency — no full-table scans in Python.
"""
from sqlmodel import Session, func, select

from app.infrastructure import Participant
from app.domain.metrics import MetricsResponse


def compute_metrics(session: Session) -> MetricsResponse:
    """Build a MetricsResponse from live participant data in one DB round-trip."""

    total = session.exec(select(func.count(Participant.participant_id))).one()

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

    # Status counts
    active = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.status == "active")
    ).one()
    completed = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.status == "completed")
    ).one()
    withdrawn = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.status == "withdrawn")
    ).one()

    # Study group counts
    treatment = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.study_group == "treatment")
    ).one()
    control = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.study_group == "control")
    ).one()

    # Gender counts
    male = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.gender == "M")
    ).one()
    female = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.gender == "F")
    ).one()
    other_gender = session.exec(
        select(func.count(Participant.participant_id)).where(Participant.gender == "Other")
    ).one()

    # Average age
    avg_age = session.exec(select(func.avg(Participant.age))).one() or 0.0

    # Derived percentages
    retention_rate = round(((total - withdrawn) / total) * 100, 1) if total > 0 else 0.0
    completion_rate = round((completed / total) * 100, 1) if total > 0 else 0.0

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
        avg_age=round(avg_age, 1),
    )
