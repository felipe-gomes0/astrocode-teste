from typing import Any, List
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.appointment import Appointment
from app.models.user import User
from app.models.service import Service
from app.models.professional import Professional
from app.models.working_hours import WorkingHours
from app.models.block import Block
from app.schemas.appointment import Appointment as AppointmentSchema, AppointmentCreate, AppointmentUpdate

router = APIRouter()

@router.post("/", response_model=AppointmentSchema)
def create_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: AppointmentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new appointment.
    """
    # Check if slot is available (simplified for now, full validation in available-slots)
    # Check if professional exists
    professional = db.query(Professional).filter(Professional.id == appointment_in.professional_id).first()
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")

    # Check if service exists
    service = db.query(Service).filter(Service.id == appointment_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    appointment = Appointment(
        professional_id=appointment_in.professional_id,
        client_id=current_user.id, # Force client to be current user
        service_id=appointment_in.service_id,
        date_time=appointment_in.date_time,
        duration=service.duration,
        notes=appointment_in.notes
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("/my-appointments", response_model=List[AppointmentSchema])
def read_my_appointments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve appointments for the current user (as client or professional).
    """
    if current_user.type == "professional" and current_user.professional:
        appointments = db.query(Appointment).filter(
            Appointment.professional_id == current_user.professional.id
        ).offset(skip).limit(limit).all()
    else:
        appointments = db.query(Appointment).filter(
            Appointment.client_id == current_user.id
        ).offset(skip).limit(limit).all()
        
    return appointments

@router.get("/available-slots")
def get_available_slots(
    professional_id: int,
    date: str, # YYYY-MM-DD
    service_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get available slots for a professional on a specific date.
    """
    return {"date": date, "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"]}


@router.put("/{id}", response_model=AppointmentSchema)
def update_appointment(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    appointment_in: AppointmentUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an appointment.
    """
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Permission check: Only updated by professional (status) or client (maybe notes?)
    # For simplicity, allow professional to update status/time
    if current_user.type == "professional" and current_user.professional.id == appointment.professional_id:
        pass
    # Allow client to update? Maybe reschedule?
    elif current_user.id == appointment.client_id:
        pass 
    else:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = appointment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)

    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.delete("/{id}", response_model=AppointmentSchema)
def delete_appointment(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Cancel an appointment.
    """
    appointment = db.query(Appointment).filter(Appointment.id == id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if current_user.id != appointment.client_id and (
        current_user.type != "professional" or current_user.professional.id != appointment.professional_id
    ):
         raise HTTPException(status_code=403, detail="Not enough permissions")

    db.delete(appointment)
    db.commit()
    return appointment
