from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify health endpoint is reachable and database is connected."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_login_success():
    """Verify login succeeds and signs JWT tokens for correct credentials."""
    response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "Dr. Aris Thorne"
    assert data["role"] == "Lead Investigator"

def test_login_failure():
    """Verify login fails with HTTP 401 for incorrect credentials."""
    response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "detail" in response.json()

def test_get_participants_unauthorized():
    """Verify GET on protected participant route fails with HTTP 403 when token is missing."""
    response = client.get("/api/v1/participants")
    # FastAPI HTTPBearer returns 403 Forbidden when the Authorization header is missing
    assert response.status_code == 403

def test_get_participants_authorized():
    """Verify GET on protected participant route succeeds with HTTP 200 when presenting valid JWT."""
    # Obtain token
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Query route
    response = client.get("/api/v1/participants", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 6 # Pre-seeded participants

def test_create_participant_authorized():
    """Verify POST succeeds and registers a new case when presenting a valid JWT."""
    # Cleanup database state for P099 if it exists from a previous run
    from app.core.database import engine
    from sqlmodel import Session, select
    from app.models import Participant
    with Session(engine) as session:
        existing = session.exec(select(Participant).where(Participant.subject_id == "P099")).first()
        if existing:
            session.delete(existing)
            session.commit()

    # Obtain token
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # Create record
    response = client.post("/api/v1/participants", json={
        "subject_id": "P099",
        "study_group": "treatment",
        "enrollment_date": "2023-10-25",
        "status": "active",
        "age": 45,
        "gender": "F"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["subject_id"] == "P099"
    assert data["study_group"] == "treatment"
    assert data["age"] == 45
    assert data["gender"] == "F"

def test_update_participant_authorized():
    """Verify PUT succeeds and modifies a participant's details when presenting a valid JWT."""
    # Obtain token
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
    # First, query all participants to get a valid UUID
    list_response = client.get("/api/v1/participants", headers={
        "Authorization": f"Bearer {token}"
    })
    participants = list_response.json()
    assert len(participants) > 0
    target_uuid = participants[0]["participant_id"]
    original_subject_id = participants[0]["subject_id"]
    
    # Update the record (e.g., change age and gender)
    update_response = client.put(f"/api/v1/participants/{target_uuid}", json={
        "age": 55,
        "gender": "Other"
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["age"] == 55
    assert data["gender"] == "Other"
    assert data["subject_id"] == original_subject_id
