"""
CRUD operations for the Participant model.

All direct database interaction for participants lives here.
Routers call these functions and handle HTTP-level concerns (exceptions, status codes).
"""
from uuid import UUID

from sqlmodel import Session, func, select

from app.infrastructure import Participant
from app.domain import ParticipantCreate, ParticipantUpdate

_DEFAULT_LIMIT = 50
_MAX_LIMIT = 200


def get_all_participants(
    session: Session,
    *,
    skip: int = 0,
    limit: int = _DEFAULT_LIMIT,
) -> tuple[int, list[Participant]]:
    """
    Return a (total_count, page_items) tuple.

    ``total`` is the full dataset size (ignoring pagination) so the caller
    can build a proper paginated response without a second round-trip.
    """
    total = session.exec(select(func.count(Participant.participant_id))).one()
    items = session.exec(select(Participant).offset(skip).limit(limit)).all()
    return total, items


def get_participant_by_id(session: Session, participant_id: UUID) -> Participant | None:
    """Return a single participant by primary key UUID, or None if not found."""
    return session.get(Participant, participant_id)


def get_participant_by_subject_id(session: Session, subject_id: str) -> Participant | None:
    """Return a participant matching the given subject_id, or None."""
    statement = select(Participant).where(Participant.subject_id == subject_id)
    return session.exec(statement).first()


def create_participant(session: Session, data: ParticipantCreate) -> Participant:
    """
    Persist a new participant to the database.

    The caller is responsible for checking uniqueness constraints before
    calling this function (e.g. duplicate subject_id).
    Enum fields are stored natively — no manual .value conversion required.
    """
    db_participant = Participant(
        subject_id=data.subject_id,
        study_group=data.study_group,
        enrollment_date=data.enrollment_date,
        status=data.status,
        age=data.age,
        gender=data.gender,
    )
    session.add(db_participant)
    session.commit()
    session.refresh(db_participant)
    return db_participant


def update_participant(
    session: Session,
    db_participant: Participant,
    data: ParticipantUpdate,
) -> Participant:
    """
    Apply a partial update to an existing Participant and persist the changes.

    Enum fields are stored natively by the ORM — no manual .value conversion needed.
    """
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_participant, key, value)

    session.add(db_participant)
    session.commit()
    session.refresh(db_participant)
    return db_participant


def delete_participant(session: Session, db_participant: Participant) -> None:
    """Permanently remove a participant from the database."""
    session.delete(db_participant)
    session.commit()
