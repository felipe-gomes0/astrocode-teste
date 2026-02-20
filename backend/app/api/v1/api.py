from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    professionals,
    services,
    appointments,
    clients,
    reviews,
    users,
    logs,
    working_hours,
    blocks,
    guest_appointments,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(professionals.router, prefix="/professionals", tags=["professionals"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(working_hours.router, prefix="/working-hours", tags=["working-hours"])
api_router.include_router(blocks.router, prefix="/blocks", tags=["blocks"])
api_router.include_router(guest_appointments.router, prefix="/guest-appointments", tags=["guest-appointments"])

