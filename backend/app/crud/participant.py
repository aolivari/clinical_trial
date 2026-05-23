"""
CRUD operations for the Participant model.

All direct database interaction for participants lives here.
Routers call these functions and handle HTTP-level concerns (exceptions, status codes).
"""
from uuid import UUID

from sqlmodel import Session, select

from app.models import Participant
from app.schemas import ParticipantCreate, ParticipantUpdate


def get_all_participants(session: Session) -> list[Participant]:
    """Return all participants in the database."""
    return session.exec(select(Participant)).all()


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
    """
    db_participant = Participant(
        subject_id=data.subject_id,
        study_group=data.study_group.value.lower(),
        enrollment_date=data.enrollment_date,
        status=data.status.value.lower(),
        age=data.age,
        gender=data.gender.value,
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

    Enum fields (study_group, status, gender) are stored as their raw string
    values; all other fields are set as-is.
    """
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in {"study_group", "status", "gender"} and value is not None:
            setattr(db_participant, key, value.value)
        else:
            setattr(db_participant, key, value)

    session.add(db_participant)
    session.commit()
    session.refresh(db_participant)
    return db_participant


def delete_participant(session: Session, db_participant: Participant) -> None:
    """Permanently remove a participant from the database."""
    session.delete(db_participant)
    session.commit()
