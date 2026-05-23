import os
import pytest
from sqlmodel import SQLModel

# Configure environment variables before importing app components
# This ensures that engine and configuration are loaded with the test database path.
os.environ["DATABASE_URL"] = "sqlite:///./test_clinical_trial.db"

from app.core.database import engine

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
    
    # Import client and enter its context to trigger FastAPI lifespan (which seeds the DB)
    from app.test_main import client
    with client:
        yield
    
    # Dispose all connections so SQLite releases the file lock
    engine.dispose()
    
    # Clean up test database file
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass
