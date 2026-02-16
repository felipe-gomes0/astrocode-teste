from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, Appointment as AppointmentSchema

router = APIRouter()

@router.get("/my-appointments", response_model=List[AppointmentSchema])
def read_my_appointments(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve current user's appointments.
    """
    if current_user.type == "client":
        appointments = db.query(Appointment).filter(
            Appointment.client_id == current_user.id
        ).offset(skip).limit(limit).all()
    else:
        # Professional
        # Assuming professional is linked to user
        if not current_user.professional:
             return []
        appointments = db.query(Appointment).filter(
            Appointment.professional_id == current_user.professional.id
        ).offset(skip).limit(limit).all()
        
    return appointments

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
    if current_user.type != "client":
         raise HTTPException(status_code=400, detail="Only clients can book appointments")

    appointment = Appointment(
        **appointment_in.model_dump(),
        client_id=current_user.id,
        status=AppointmentStatus.PENDENTE
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.delete("/{id}", response_model=AppointmentSchema)
def cancel_appointment(
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
    
    # Check permissions
    if appointment.client_id != current_user.id and (
        not current_user.professional or appointment.professional_id != current_user.professional.id
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    appointment.status = AppointmentStatus.CANCELADO
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
