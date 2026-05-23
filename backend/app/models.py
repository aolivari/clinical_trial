from datetime import date
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class Participant(SQLModel, table=True):
    __tablename__ = "participants"

    participant_id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    subject_id: str = Field(index=True, unique=True, nullable=False)
    study_group: str = Field(nullable=False)  # "treatment" or "control"
    enrollment_date: date = Field(nullable=False) # Stores YYYY-MM-DD
    status: str = Field(nullable=False)  # "active", "completed", or "withdrawn"
    age: int = Field(nullable=False)
    gender: str = Field(nullable=False)  # "F", "M", or "Other"
