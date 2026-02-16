from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base
import uuid6
from sqlalchemy.dialects.postgresql import UUID

class UserType(str, enum.Enum):
    PROFESSIONAL = "professional"
    CLIENT = "client"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid6.uuid7, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String)
    type = Column(Enum(UserType), nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    professional = relationship("Professional", back_populates="user", uselist=False)
    # Import inside method or use string to avoid circular import if needed, but string is already used.
    # Just ensure Appointment is imported in base or available in registry
    appointments_as_client = relationship("Appointment", foreign_keys="Appointment.client_id", back_populates="client")
    reviews = relationship("Review", back_populates="client")