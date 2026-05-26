from datetime import date
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel
from sqlalchemy import Enum as SAEnum

from app.domain.participant import StudyGroup, ParticipantStatus, Gender


class Participant(SQLModel, table=True):
    __tablename__ = "participants"

    participant_id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    subject_id: str = Field(index=True, unique=True, nullable=False)
    study_group: StudyGroup = Field(
        sa_type=SAEnum(StudyGroup, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    enrollment_date: date = Field(nullable=False)
    status: ParticipantStatus = Field(
        sa_type=SAEnum(ParticipantStatus, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
    age: int = Field(nullable=False)
    gender: Gender = Field(
        sa_type=SAEnum(Gender, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False
    )
