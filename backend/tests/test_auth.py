from fastapi.testclient import TestClient
from app.core.config import settings
from app.models.user import User

def test_login_access_token(client: TestClient, normal_user: User) -> None:
    login_data = {
        "username": normal_user.email,
        "password": "password123",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/access-token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]

def test_login_access_token_invalid(client: TestClient) -> None:
    login_data = {
        "username": "invalid@example.com",
        "password": "wrongpassword",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/access-token", data=login_data)
    assert r.status_code == 400
    assert r.json()["error"] == "Incorrect email or password"
