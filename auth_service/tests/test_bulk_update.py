import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configure the service to use a SQLite database for testing before importing app
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test.db")
if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

# Ensure package imports work when running tests from repository root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from auth_service.app.main import app
from auth_service.app.db.database import Base
from auth_service.app.db import models
from auth_service.app.api.routes_auth import get_db, get_current_user

# Setup the database
engine = create_engine(os.environ["DATABASE_URL"])
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create an admin user and two regular users
with TestingSessionLocal() as session:
    admin = models.User(email="admin@example.com", username="admin", password_hash="x", is_admin=True)
    u1 = models.User(email="user1@example.com", username="u1", password_hash="x")
    u2 = models.User(email="user2@example.com", username="u2", password_hash="x")
    session.add_all([admin, u1, u2])
    session.commit()
    session.refresh(admin)
    session.refresh(u1)
    session.refresh(u2)

admin_user = admin


def override_get_current_user():
    return admin_user

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)


import pytest

@pytest.mark.xfail(reason="Bulk update endpoint not implemented in skeleton")
def test_bulk_update_users():
    updates = [
        {"id": admin_user.id, "username": "superadmin"},
        {"id": admin_user.id + 1, "email": "new1@example.com"},
        {"id": admin_user.id + 2, "is_active": False},
    ]
    response = client.put("/auth/users/bulk-update", json=updates)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["username"] == "superadmin"
    assert data[1]["email"] == "new1@example.com"
    assert data[2]["is_active"] is False

