from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.core.enums.appointment_status import AppointmentStatus

from sqlalchemy.dialects.postgresql import UUID

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"))
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    date_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    professional = relationship("Professional", back_populates="appointments")
    client = relationship("User", foreign_keys=[client_id], back_populates="appointments_as_client")
    service = relationship("Service", back_populates="appointments")
    review = relationship("Review", back_populates="appointment", uselist=False)

    @property
    def professional_name(self) -> str | None:
        if self.professional and self.professional.user:
            return self.professional.user.name
        return None

    @property
    def client_name(self) -> str | None:
        if self.client:
            return self.client.name
        return None

    @property
    def service_name(self) -> str | None:
        if self.service:
            return self.service.name
        return None

    @property
    def service_price(self) -> float | None:
        if self.service:
            return float(self.service.price) if self.service.price else None