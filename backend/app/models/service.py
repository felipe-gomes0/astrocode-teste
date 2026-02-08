from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    duration = Column(Integer, nullable=False)  # em minutos
    price = Column(Numeric(10, 2))
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    professional = relationship("Professional", back_populates="services")
    appointments = relationship("Appointment", back_populates="service")