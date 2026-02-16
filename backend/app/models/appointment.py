from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from  app.core.database import Base

class AppointmentStatus(str, enum.Enum):
    PENDENTE = 'pendente'
    CONFIRMADO = 'confirmado'
    CANCELADO = 'cancelado'
    CONCLUIDO = 'concluido'

from sqlalchemy.dialects.postgresql import UUID

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False) # Changed to UUID
    # User.id is defined as UUID(as_uuid=True) in User model.
    # We should verify User model definition.
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    data_hora = Column(DateTime, nullable=False)
    duracao = Column(Integer, nullable=False) # Duration in minutes
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDENTE, nullable=False)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    professional = relationship("Professional", back_populates="appointments")
    client = relationship("User", back_populates="appointments_as_client")
    service = relationship("Service", back_populates="appointments")
    review = relationship("Review", back_populates="appointment", uselist=False)