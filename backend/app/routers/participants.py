from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.participant import (
    create_participant,
    delete_participant,
    get_all_participants,
    get_participant_by_id,
    get_participant_by_subject_id,
    update_participant,
)
from app.schemas import ParticipantCreate, ParticipantResponse, ParticipantUpdate

router = APIRouter(
    prefix="/api/v1/participants",
    tags=["Participants"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[ParticipantResponse])
def list_participants(session: Session = Depends(get_db)):
    """Fetch all clinical trial participants. Requires authorization."""
    return get_all_participants(session)


@router.get("/{participant_id}", response_model=ParticipantResponse)
def get_participant(participant_id: UUID, session: Session = Depends(get_db)):
    """Fetch a single participant by UUID. Requires authorization."""
    participant = get_participant_by_id(session, participant_id)
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found",
        )
    return participant


@router.post("", response_model=ParticipantResponse, status_code=status.HTTP_201_CREATED)
def register_participant(participant_in: ParticipantCreate, session: Session = Depends(get_db)):
    """Register a new clinical trial participant. Requires authorization."""
    if get_participant_by_subject_id(session, participant_in.subject_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Participant with Subject ID '{participant_in.subject_id}' already exists",
        )
    return create_participant(session, participant_in)


@router.put("/{participant_id}", response_model=ParticipantResponse)
def edit_participant(
    participant_id: UUID,
    participant_in: ParticipantUpdate,
    session: Session = Depends(get_db),
):
    """Update properties of an existing participant. Requires authorization."""
    db_participant = get_participant_by_id(session, participant_id)
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found",
        )

    # Check uniqueness only when subject_id is being changed
    update_data = participant_in.model_dump(exclude_unset=True)
    new_subject_id = update_data.get("subject_id")
    if new_subject_id and new_subject_id != db_participant.subject_id:
        if get_participant_by_subject_id(session, new_subject_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Participant with Subject ID '{new_subject_id}' already exists",
            )

    return update_participant(session, db_participant, participant_in)


@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_participant(participant_id: UUID, session: Session = Depends(get_db)):
    """Delete a participant by ID. Requires authorization."""
    db_participant = get_participant_by_id(session, participant_id)
    if not db_participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant with ID {participant_id} not found",
        )
    delete_participant(session, db_participant)
