def test_health_check(client):
    """Verify health endpoint is reachable and database is connected."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
