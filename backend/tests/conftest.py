import os
import pytest
from sqlmodel import SQLModel
from fastapi.testclient import TestClient

# Configure environment variables before importing app components
# This ensures that engine and configuration are loaded with the test database path.
os.environ["DATABASE_URL"] = "sqlite:///./test_clinical_trial.db"
os.environ["TESTING"] = "true"


from app.infrastructure.database import engine
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Ensure a clean slate at the start of the session
    db_file = "./test_clinical_trial.db"
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass
            
    # Force creation of database and tables
    SQLModel.metadata.create_all(engine)
    
    # Trigger FastAPI lifespan (which seeds the DB)
    with TestClient(app):
        yield
    
    # Dispose all connections so SQLite releases the file lock
    engine.dispose()
    
    # Clean up test database file
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass

@pytest.fixture(scope="session")
def client():
    """Shared TestClient fixture."""
    with TestClient(app) as c:
        yield c
