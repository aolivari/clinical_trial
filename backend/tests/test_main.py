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
    assert "refresh_token" in data
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

def test_login_invalid_email_format():
    """Verify login fails with HTTP 422 when email format is invalid."""
    response = client.post("/api/v1/auth/login", json={
        "email": "invalid-email-format",
        "password": "password123"
    })
    assert response.status_code == 422
    assert "detail" in response.json()

def test_token_refresh_flow():
    """Verify that we can refresh an access token using a valid refresh token."""
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    assert login_response.status_code == 200
    login_data = login_response.json()
    refresh_token = login_data["refresh_token"]
    
    refresh_response = client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert refresh_response.status_code == 200
    refresh_data = refresh_response.json()
    assert "access_token" in refresh_data
    assert "refresh_token" in refresh_data
    assert refresh_data["token_type"] == "bearer"
    
    # Verify old refresh token is revoked
    second_refresh_response = client.post("/api/v1/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert second_refresh_response.status_code == 401
    assert "Invalid or revoked refresh token." in second_refresh_response.json()["detail"]

def test_expired_access_token():
    """Verify that an expired access token is rejected."""
    from app.core.security import create_access_token
    from datetime import timedelta
    
    token_payload = {
        "sub": "researcher@clintrack.com",
        "role": "Lead Investigator",
        "username": "Dr. Aris Thorne"
    }
    expired_token = create_access_token(data=token_payload, expires_delta=timedelta(minutes=-5))
    
    response = client.get("/api/v1/participants", headers={
        "Authorization": f"Bearer {expired_token}"
    })
    assert response.status_code == 401
    assert "Session expired. Please refresh token." in response.json()["detail"]

def test_get_participants_unauthorized():
    """Verify GET on protected participant route fails with HTTP 403 when token is missing."""
    response = client.get("/api/v1/participants")
    # FastAPI HTTPBearer returns 403 Forbidden when the Authorization header is missing
    assert response.status_code == 403

def test_get_participants_authorized():
    """Verify GET on protected participant route succeeds with HTTP 200 and paginated response."""
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    response = client.get("/api/v1/participants", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json()
    # Response is now paginated
    assert "total" in data
    assert "skip" in data
    assert "limit" in data
    assert "items" in data
    assert isinstance(data["items"], list)
    assert data["total"] >= 6  # Pre-seeded participants
    assert data["skip"] == 0
    assert data["limit"] == 50

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

def test_pagination_params():
    """Verify that skip and limit query params correctly slice the result set."""
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Page 1: first 2 records
    r1 = client.get("/api/v1/participants?skip=0&limit=2", headers=headers)
    assert r1.status_code == 200
    d1 = r1.json()
    assert len(d1["items"]) == 2
    assert d1["skip"] == 0
    assert d1["limit"] == 2

    # Page 2: next 2 records — must be different from page 1
    r2 = client.get("/api/v1/participants?skip=2&limit=2", headers=headers)
    assert r2.status_code == 200
    d2 = r2.json()
    assert len(d2["items"]) == 2
    ids_page1 = {p["participant_id"] for p in d1["items"]}
    ids_page2 = {p["participant_id"] for p in d2["items"]}
    assert ids_page1.isdisjoint(ids_page2), "Pages must not overlap"

    # total must be consistent across pages
    assert d1["total"] == d2["total"]


def test_pagination_limit_validation():
    """Verify that limit > 200 is rejected with HTTP 422."""
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    response = client.get("/api/v1/participants?limit=999", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 422


def test_update_participant_authorized():
    """Verify PUT succeeds and modifies a participant's details when presenting a valid JWT."""
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    # Query all participants — now paginated
    list_response = client.get("/api/v1/participants", headers={
        "Authorization": f"Bearer {token}"
    })
    participants = list_response.json()["items"]
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
