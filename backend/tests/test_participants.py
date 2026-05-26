def test_get_participants_unauthorized(client):
    """Verify GET on protected participant route fails with HTTP 403 when token is missing."""
    response = client.get("/api/v1/participants")
    # FastAPI HTTPBearer returns 403 Forbidden when the Authorization header is missing
    assert response.status_code == 403

def test_get_participants_authorized(client):
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
    assert "total" in data
    assert "skip" in data
    assert "limit" in data
    assert "items" in data
    assert isinstance(data["items"], list)
    assert data["total"] >= 6  # Pre-seeded participants
    assert data["skip"] == 0
    assert data["limit"] == 50

def test_create_participant_authorized(client):
    """Verify POST succeeds and registers a new case when presenting a valid JWT."""
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]
    
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

def test_pagination_params(client):
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
    assert d1["total"] == d2["total"]

def test_pagination_limit_validation(client):
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

def test_update_participant_authorized(client):
    """Verify PATCH succeeds and modifies a participant's details when presenting a valid JWT."""
    login_response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "password123"
    })
    token = login_response.json()["access_token"]

    list_response = client.get("/api/v1/participants", headers={
        "Authorization": f"Bearer {token}"
    })
    participants = list_response.json()["items"]
    assert len(participants) > 0
    target_uuid = participants[0]["participant_id"]
    original_subject_id = participants[0]["subject_id"]

    # Update the record (e.g., change age and gender) via PATCH
    update_response = client.patch(f"/api/v1/participants/{target_uuid}", json={
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
