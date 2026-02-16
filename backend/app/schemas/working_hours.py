from typing import Optional
from pydantic import BaseModel, ConfigDict

# Shared properties
class WorkingHoursBase(BaseModel):
    dia_semana: int
    hora_inicio: str
    hora_fim: str
    ativo: Optional[bool] = True

# Properties to receive via API on creation
class WorkingHoursCreate(WorkingHoursBase):
    professional_id: int

# Properties to receive via API on update
class WorkingHoursUpdate(BaseModel):
    dia_semana: Optional[int] = None
    hora_inicio: Optional[str] = None
    hora_fim: Optional[str] = None
    ativo: Optional[bool] = None

# Properties shared by models stored in DB
class WorkingHoursInDBBase(WorkingHoursBase):
    id: int
    professional_id: int
    
    model_config = ConfigDict(from_attributes=True)

# Additional properties to return via API
class WorkingHours(WorkingHoursInDBBase):
    pass
# Additional properties stored in DB
class WorkingHoursInDB(WorkingHoursInDBBase):
    pass
