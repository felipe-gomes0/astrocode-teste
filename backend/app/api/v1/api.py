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
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["professionals"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])

