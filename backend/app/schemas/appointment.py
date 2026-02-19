from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.core.enums.appointment_status import AppointmentStatus
from app.schemas.professional import ProfessionalBase
from app.schemas.service import ServiceBase
from app.schemas.user import UserBase

# Shared properties
class AppointmentBase(BaseModel):
    date_time: datetime
    duration: int
    status: Optional[AppointmentStatus] = AppointmentStatus.PENDING
    notes: Optional[str] = None

from uuid import UUID

# Properties to receive via API on creation
class AppointmentCreate(AppointmentBase):
    professional_id: int
    service_id: int

# Properties to receive via API on update
class AppointmentUpdate(BaseModel):
    date_time: Optional[datetime] = None
    duration: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None

# Properties shared by models stored in DB
class AppointmentInDBBase(AppointmentBase):
    id: int
    professional_id: int
    client_id: UUID
    service_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Additional properties to return via API
class Appointment(AppointmentInDBBase):
    professional_name: Optional[str] = None
    client_name: Optional[str] = None
    service_name: Optional[str] = None
    service_price: Optional[float] = None

# Additional properties stored in DB
class AppointmentInDB(AppointmentInDBBase):
    pass
