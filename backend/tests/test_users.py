import pytest
from fastapi.testclient import TestClient
from app.core.config import settings
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate
from app.models.user import UserType

def test_delete_user_me(client: TestClient, db) -> None:
    # Criar usuário específico para ser deletado
    email = "delete_me@example.com"
    user_in = UserCreate(
        email=email,
        password="password123",
        name="Delete Me",
        type=UserType.CLIENT,
        active=True
    )
    user_to_delete = crud_user.create(db, obj_in=user_in)

    # Autenticar
    login_data = {
        "username": email,
        "password": "password123",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/access-token", data=login_data)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Tentar deletar a si mesmo
    r = client.delete(f"{settings.API_V1_STR}/users/{user_to_delete.id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["id"] == str(user_to_delete.id)
    
    # Verificar se foi removido
    user = crud_user.get(db, id=user_to_delete.id)
    assert user is None

def test_delete_other_user_forbidden(client: TestClient, normal_user, db) -> None:
    # Criar outro usuário
    other_email = "other_user@example.com"
    other_user_in = UserCreate(
        email=other_email,
        password="password123",
        name="Other User",
        type=UserType.CLIENT,
        active=True
    )
    other_user = crud_user.get_by_email(db, email=other_email)
    if not other_user:
        other_user = crud_user.create(db, obj_in=other_user_in)
    
    # Autenticar como normal_user
    login_data = {
        "username": normal_user.email,
        "password": "password123",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/access-token", data=login_data)
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Tentar deletar o outro usuário
    r = client.delete(f"{settings.API_V1_STR}/users/{other_user.id}", headers=headers)
    
    # Deve ser proibido (403)
    assert r.status_code == 403
    assert r.json()["detail"] == "Not enough permissions"

    # Limpeza
    crud_user.remove(db, id=other_user.id)
