import os
from pathlib import Path
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

SERVICES = [
    'auth_service',
    'user_service',
    'workshop_service',
    'quiz_service',
    'analytics_service',
    'certificate_service'
]


def test_database_connections():
    for service in SERVICES:
        env_path = Path(service) / '.env'
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        url = os.environ.get('DATABASE_URL', 'sqlite:///:memory:')
        engine = create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1'))
            assert result.scalar() == 1
