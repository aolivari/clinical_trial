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
