from sqlmodel import create_engine, SQLModel, Session
from app.core.config import DATABASE_URL

# connect_args={"check_same_thread": False} is required only for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def init_db():
    # Import models here to ensure they are registered with SQLModel's metadata
    from app.infrastructure import Participant, User, RefreshToken
    SQLModel.metadata.create_all(engine)

# Dependency for endpoints (Guarantees the session is always closed)
def get_db():
    with Session(engine) as session:
        yield session
