from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Participant
from app.schemas import ParticipantCreate, ParticipantResponse, ParticipantUpdate

router = APIRouter(
    prefix="/api/v1/participants",
    tags=["Participants"],
    dependencies=[Depends(get_current_user)]
)

@router.get("", response_model=list[ParticipantResponse])
def get_participants(session: Session = Depends(get_db)):
    """Fetch all clinical trial participants. Requires authorization."""
    statement = select(Participant)
    results = session.exec(statement).all()
    return results

@router.get("/{participant_id}", response_model=ParticipantResponse)
def get_participant(
    participant_id: UUID, 
    session: Session = Depends(get_db)
):
    """Fetch a single participant by UUID. Requires authorization."""
    participant = session.get(Participant, participant_id)
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found"
        )
    return participant

@router.post("", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
def create_participant(
    participant_in: ParticipantCreate, 
    session: Session = Depends(get_db)
):
    """Register a new clinical trial participant. Requires authorization."""
    # Check if subject_id already exists
    statement = select(Participant).where(Participant.subject_id == participant_in.subject_id)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Participant with Subject ID {participant_in.subject_id} already exists"
        )
    
    db_participant = Participant(
        subject_id=participant_in.subject_id,
        study_group=participant_in.study_group.value.lower(),
        enrollment_date=participant_in.enrollment_date,
        status=participant_in.status.value.lower(),
        age=participant_in.age,
        gender=participant_in.gender.value
    )
    session.add(db_participant)
    session.commit()
    session.refresh(db_participant)
    return db_participant

@router.put("/{participant_id}", response_model=ParticipantResponse)
def update_participant(
    participant_id: UUID, 
    participant_in: ParticipantUpdate, 
    session: Session = Depends(get_db)
):
    """Update properties of an existing participant. Requires authorization."""
    db_participant = session.get(Participant, participant_id)
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found"
        )
    
    update_data = participant_in.model_dump(exclude_unset=True)
    if "subject_id" in update_data and update_data["subject_id"] != db_participant.subject_id:
        existing = session.exec(
            select(Participant).where(Participant.subject_id == update_data["subject_id"])
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Participant with Subject ID {update_data['subject_id']} already exists"
            )
            
    for key, value in update_data.items():
        if key in ["study_group", "status", "gender"] and value is not None:
            setattr(db_participant, key, value.value)
        else:
            setattr(db_participant, key, value)
        
    session.add(db_participant)
    session.commit()
    session.refresh(db_participant)
    return db_participant

@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(
    participant_id: UUID, 
    session: Session = Depends(get_db)
):
    """Delete a participant by ID. Requires authorization."""
    db_participant = session.get(Participant, participant_id)
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found"
        )
    session.delete(db_participant)
    session.commit()
    return None
