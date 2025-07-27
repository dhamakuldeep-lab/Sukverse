import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables from the service .env if available
load_dotenv(os.path.join('auth_service', '.env'))


def test_database_connection():
    database_url = os.environ["DATABASE_URL"]
    engine = create_engine(database_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1

