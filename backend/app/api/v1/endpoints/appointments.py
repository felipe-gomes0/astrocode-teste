
from typing import Any, List
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.models.appointment import Appointment
from app.models.user import User
from app.models.service import Service
from app.models.professional import Professional
from app.models.working_hours import WorkingHours
from app.models.block import Block
from app.schemas.appointment import Appointment as AppointmentSchema, AppointmentCreate, AppointmentUpdate
from app.services.notifications import send_appointment_confirmation

router = APIRouter()

@router.post("/", response_model=AppointmentSchema)
def create_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: AppointmentCreate,
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks,
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

    # Queue confirmation email to be sent in the background using FastAPI's queue
    background_tasks.add_task(
        send_appointment_confirmation,
        client_name=current_user.name,
        client_email=current_user.email,
        date_time=appointment_in.date_time,
        service_name=service.name,
        professional_name=professional.user.name if professional.user else "Profissional",
        duration=service.duration,
    )

    # Re-query with joined models to avoid lazy-loading issues during serialization
    appointment = db.query(Appointment).options(
        joinedload(Appointment.professional).joinedload(Professional.user),
        joinedload(Appointment.client),
        joinedload(Appointment.service)
    ).filter(Appointment.id == appointment.id).first()

    return appointment

from sqlalchemy.orm import joinedload

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
    # Eager load relationships needed for response properties
    query = db.query(Appointment).options(
        joinedload(Appointment.professional).joinedload(Professional.user),
        joinedload(Appointment.service),
        joinedload(Appointment.client)
    )

    if current_user.type == "professional" and current_user.professional:
        appointments = query.filter(
            Appointment.professional_id == current_user.professional.id
        ).offset(skip).limit(limit).all()
    else:
        appointments = query.filter(
            Appointment.client_id == current_user.id
        ).offset(skip).limit(limit).all()
        
    return appointments

from datetime import timedelta, date as date_cls, time as time_cls, datetime

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
    try:
        query_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    weekday = query_date.weekday() # 0=Monday, 6=Sunday

    # 1. Get working hours
    working_hours = db.query(WorkingHours).filter(
        WorkingHours.professional_id == professional_id,
        WorkingHours.day_of_week == weekday,
        WorkingHours.active == True
    ).first()

    if not working_hours:
        return {"date": date, "slots": []}

    # 2. Get service duration
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    duration = service.duration # in minutes

    # 3. Get existing appointments
    appointments = db.query(Appointment).filter(
        Appointment.professional_id == professional_id,
        Appointment.date_time >= datetime.combine(query_date, time_cls.min),
        Appointment.date_time <= datetime.combine(query_date, time_cls.max),
        Appointment.status != "cancelled" # Assuming there's a cancelled status or similar logic
    ).all()

    # 4. Get blocks
    # Blocks can span multiple days, so we check for overlap
    # Block start < day_end AND Block end > day_start
    day_start = datetime.combine(query_date, time_cls.min)
    day_end = datetime.combine(query_date, time_cls.max)
    
    blocks = db.query(Block).filter(
        Block.professional_id == professional_id,
        Block.start_time < day_end,
        Block.end_time > day_start
    ).all()

    # 5. Generate slots
    slots = []
    current_time = datetime.combine(query_date, working_hours.start_time)
    end_time = datetime.combine(query_date, working_hours.end_time)

    while current_time + timedelta(minutes=duration) <= end_time:
        slot_start = current_time
        slot_end = current_time + timedelta(minutes=duration)
        
        is_available = True
        
        # Check appointments
        for appt in appointments:
            appt_start = appt.date_time
            appt_end = appt.date_time + timedelta(minutes=appt.duration)
            
            # Check overlap: (StartA < EndB) and (EndA > StartB)
            if slot_start < appt_end and slot_end > appt_start:
                is_available = False
                break
        
        # Check blocks
        if is_available:
            for block in blocks:
                # Check overlap
                if slot_start < block.end_time and slot_end > block.start_time:
                    is_available = False
                    break
        
        if is_available:
            slots.append(slot_start.strftime("%H:%M"))
            
        current_time += timedelta(minutes=duration)

    return {"date": date, "slots": slots}


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
