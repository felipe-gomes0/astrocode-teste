from typing import Any
from datetime import datetime
import secrets

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.core.security import get_password_hash
from app.models.appointment import Appointment
from app.models.user import User, UserType
from app.models.service import Service
from app.models.professional import Professional
from app.schemas.appointment import Appointment as AppointmentSchema, GuestAppointmentCreate
from app.services.notifications import send_appointment_confirmation

router = APIRouter()

@router.post("/", response_model=AppointmentSchema)
def create_guest_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: GuestAppointmentCreate,
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Create new appointment for an unauthenticated guest user.
    Silently creates a user and client profile if the email doesn't exist.
    """
    # 1. Check if professional and service exist
    professional = db.query(Professional).filter(Professional.id == appointment_in.professional_id).first()
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")

    service = db.query(Service).filter(Service.id == appointment_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 2. Find or create the User based on email
    user = db.query(User).filter(User.email == appointment_in.client_email).first()
    
    if not user:
        # Generate a random secure password for the guest account since they won't log in immediately
        random_password = secrets.token_urlsafe(32)
        
        user = User(
            email=appointment_in.client_email,
            name=appointment_in.client_name,
            phone=appointment_in.client_phone,
            password=get_password_hash(random_password),
            type=UserType.CLIENT,
            active=True,
        )
        db.add(user)
        db.flush() # Get user ID before committing

    # 3. Create the appointment
    appointment = Appointment(
        professional_id=appointment_in.professional_id,
        client_id=user.id,
        service_id=appointment_in.service_id,
        date_time=appointment_in.date_time,
        duration=service.duration,
        notes=appointment_in.notes
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # 4. Queue confirmation email
    background_tasks.add_task(
        send_appointment_confirmation,
        client_name=user.name,
        client_email=user.email,
        date_time=appointment_in.date_time,
        service_name=service.name,
        professional_name=professional.user.name if professional.user else "Profissional",
        duration=service.duration,
    )

    # 5. Re-query with joined models to avoid lazy-loading issues during serialization
    appointment = db.query(Appointment).options(
        joinedload(Appointment.professional).joinedload(Professional.user),
        joinedload(Appointment.client),
        joinedload(Appointment.service)
    ).filter(Appointment.id == appointment.id).first()

    return appointment
