"""
Database seeding module.

Contains mock data for initial database population during development.
Called from the application lifespan handler in main.py.
"""
from datetime import date
from uuid import uuid4

from sqlmodel import Session, select

from app.infrastructure import Participant, User
from app.core.security import hash_password
from app.core.logging import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Mock clinical trial participants
# ---------------------------------------------------------------------------
_MOCK_PARTICIPANTS: list[dict] = [
    {
        "subject_id": "P001",
        "study_group": "treatment",
        "enrollment_date": date(2023, 10, 12),
        "status": "active",
        "age": 42,
        "gender": "M",
    },
    {
        "subject_id": "P002",
        "study_group": "control",
        "enrollment_date": date(2023, 10, 14),
        "status": "completed",
        "age": 29,
        "gender": "F",
    },
    {
        "subject_id": "P003",
        "study_group": "treatment",
        "enrollment_date": date(2023, 10, 15),
        "status": "active",
        "age": 51,
        "gender": "M",
    },
    {
        "subject_id": "P004",
        "study_group": "control",
        "enrollment_date": date(2023, 10, 18),
        "status": "withdrawn",
        "age": 38,
        "gender": "F",
    },
    {
        "subject_id": "P005",
        "study_group": "treatment",
        "enrollment_date": date(2023, 10, 20),
        "status": "active",
        "age": 64,
        "gender": "M",
    },
    {
        "subject_id": "P006",
        "study_group": "control",
        "enrollment_date": date(2023, 10, 21),
        "status": "active",
        "age": 45,
        "gender": "F",
    },
]

# ---------------------------------------------------------------------------
# Default researcher user
# ---------------------------------------------------------------------------
_DEFAULT_USER = {
    "email": "researcher@clintrack.com",
    "password": "password123",
    "username": "Dr. Aris Thorne",
    "role": "Lead Investigator",
}


def seed_database(session: Session) -> None:
    """
    Populate the database with mock data if tables are empty.

    Idempotent: only inserts when no records exist for each entity.
    """
    _seed_participants(session)
    _seed_users(session)


def _seed_participants(session: Session) -> None:
    """Seed mock clinical trial participants if the table is empty."""
    existing = session.exec(select(Participant)).all()
    if existing:
        logger.info("Database already contains %d participants.", len(existing))
        return

    logger.info("Database is empty. Seeding mock participant data...")
    for data in _MOCK_PARTICIPANTS:
        participant = Participant(participant_id=uuid4(), **data)
        session.add(participant)
    session.commit()
    logger.info("Mock participant seeding completed successfully.")


def _seed_users(session: Session) -> None:
    """Seed default researcher user if the table is empty."""
    existing = session.exec(select(User)).all()
    if existing:
        logger.info("Users database contains %d users.", len(existing))
        return

    logger.info("Users database is empty. Seeding default researcher user...")
    user = User(
        user_id=uuid4(),
        email=_DEFAULT_USER["email"],
        hashed_password=hash_password(_DEFAULT_USER["password"]),
        username=_DEFAULT_USER["username"],
        role=_DEFAULT_USER["role"],
    )
    session.add(user)
    session.commit()
    logger.info("Default researcher user seeding completed.")
