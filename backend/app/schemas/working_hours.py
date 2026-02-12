from typing import Optional
from datetime import time
from pydantic import BaseModel, ConfigDict

# Shared properties
class WorkingHoursBase(BaseModel):
    day: int
    start_time: time
    end_time: time
    active: Optional[bool] = True

# Properties to receive via API on creation
class WorkingHoursCreate(WorkingHoursBase):
    professional_id: int

# Properties to receive via API on update
class WorkingHoursUpdate(BaseModel):
    day: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    active: Optional[bool] = None

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
