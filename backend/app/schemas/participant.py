from datetime import date
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field

class StudyGroup(str, Enum):
    TREATMENT = "treatment"
    CONTROL = "control"

class ParticipantStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    WITHDRAWN = "withdrawn"

class Gender(str, Enum):
    F = "F"
    M = "M"
    OTHER = "Other"

class ParticipantBase(BaseModel):
    subject_id: str = Field(..., min_length=2, max_length=50, examples=["SUBJ-001"])
    study_group: StudyGroup = Field(..., examples=["treatment"])
    enrollment_date: date = Field(..., examples=["2023-10-15"])
    status: ParticipantStatus = Field(..., examples=["active"])
    age: int = Field(..., ge=0, le=120, examples=[34])
    gender: Gender = Field(..., examples=["F"])

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantUpdate(BaseModel):
    subject_id: str | None = None
    study_group: StudyGroup | None = None
    enrollment_date: date | None = None
    status: ParticipantStatus | None = None
    age: int | None = None
    gender: Gender | None = None

class ParticipantResponse(ParticipantBase):
    participant_id: UUID

    class Config:
        from_attributes = True
