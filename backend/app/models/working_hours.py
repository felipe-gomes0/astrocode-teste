from sqlalchemy import Column, Integer, ForeignKey, Time, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class WorkingHours(Base):
    __tablename__ = "working_hours"
    
    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("professionals.id"))
    dia_semana = Column(Integer, nullable=False)  # 0-6 (Segunda-Domingo)
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    ativo = Column(Boolean, default=True)
    
    # Relationships
    professional = relationship("Professional", back_populates="working_hours")