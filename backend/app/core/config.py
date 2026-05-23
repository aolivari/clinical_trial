import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables from .env file
load_dotenv(find_dotenv())

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
DATABASE_URL = "sqlite:///./clinical_trial.db"

# Fallback for local development or testing, but enforce in production
if not SECRET_KEY:
    if os.getenv("ENVIRONMENT") == "development" or os.getenv("TESTING") == "true":
        SECRET_KEY = "clintrack_super_secret_session_key_for_trial_phases"
    else:
        raise ValueError("JWT_SECRET_KEY environment variable is required and must be set in production.")

