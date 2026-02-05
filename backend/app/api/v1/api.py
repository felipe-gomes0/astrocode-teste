from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    professionals,
    services,
    appointments,
    clients,
    reviews
)

api_router = APIRouter()

