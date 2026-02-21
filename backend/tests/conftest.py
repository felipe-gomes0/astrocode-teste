import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient

# Set env var before importing app to avoid validation error
os.environ["SECRET_KEY"] = "test_secret_key_for_pytest"

from app.main import app
from app.core.database import SessionLocal
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate
from app.models.user import UserType

# Conexão com banco de dados
@pytest.fixture(scope="module")
def db() -> Generator:
    yield SessionLocal()

# Cliente de teste para requisições
@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c

# Cria usuário comum para testes
@pytest.fixture(scope="module")
def normal_user(db) -> Generator:
    email = "test_auth_user@example.com"
    password = "password123"
    user_in = UserCreate(
        email=email,
        password=password,
        name="Test Auth User",
        type=UserType.CLIENT,
        active=True
    )
    user = crud_user.get_by_email(db, email=email)
    if not user:
        user = crud_user.create(db, obj_in=user_in)
    yield user
    # Cleanup if needed, but for now we keep it or rely on test DB reset
    # crud_user.remove(db, id=user.id) 
