import sys, pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[2]))
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from auth_service.app.db.models import Base
from auth_service.app.services import auth as auth_service


@pytest.fixture()
def client_with_db(tmp_path):
    db_path = tmp_path / "test.db"
    db_url = f"sqlite:///{db_path}"
    os.environ["DATABASE_URL"] = db_url

    from auth_service.app.main import app
    from auth_service.app.db.database import get_db

    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c, TestingSessionLocal

    app.dependency_overrides.clear()


def test_register_user_creates_account(client_with_db):
    client, SessionLocal = client_with_db
    payload = {"email": "alice@example.com", "password": "strongpass"}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert "id" in data

    with SessionLocal() as db:
        user = auth_service.get_user_by_email(db, payload["email"])
        assert user is not None


def test_login_returns_token(client_with_db):
    client, _ = client_with_db
    credentials = {"email": "bob@example.com", "password": "secretpass"}
    client.post("/auth/register", json=credentials)

    response = client.post("/auth/login", json=credentials)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
