from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="review")
    client = relationship("User", back_populates="reviews")
    professional = relationship("Professional", back_populates="reviews")
