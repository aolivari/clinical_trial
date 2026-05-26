from datetime import timedelta
from app.core.security import create_access_token

def test_login_success(client):
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

def test_login_failure(client):
    """Verify login fails with HTTP 401 for incorrect credentials."""
    response = client.post("/api/v1/auth/login", json={
        "email": "researcher@clintrack.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "detail" in response.json()

def test_login_invalid_email_format(client):
    """Verify login fails with HTTP 422 when email format is invalid."""
    response = client.post("/api/v1/auth/login", json={
        "email": "invalid-email-format",
        "password": "password123"
    })
    assert response.status_code == 422
    assert "detail" in response.json()

def test_token_refresh_flow(client):
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

def test_expired_access_token(client):
    """Verify that an expired access token is rejected."""
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
