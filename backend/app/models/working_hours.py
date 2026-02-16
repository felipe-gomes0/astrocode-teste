from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class WorkingHours(Base):
    __tablename__ = "working_hours"

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"), nullable=False)
    dia_semana = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    hora_inicio = Column(String, nullable=False) # Format HH:MM
    hora_fim = Column(String, nullable=False) # Format HH:MM
    ativo = Column(Boolean, default=True)

    professional = relationship("Professional", back_populates="working_hours")