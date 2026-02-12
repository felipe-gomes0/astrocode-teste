from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

from sqlalchemy.dialects.postgresql import UUID

class Professional(Base):
    __tablename__ = "professionals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    speciality = Column(String)
    description = Column(Text)
    photo_url = Column(String)
    address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="professional")
    services = relationship("Service", back_populates="professional")
    working_hours = relationship("WorkingHours", back_populates="professional")
    blocks = relationship("Block", back_populates="professional")
    appointments = relationship("Appointment", back_populates="professional")
    reviews = relationship("Review", back_populates="professional")