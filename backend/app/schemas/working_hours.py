from typing import Optional
from datetime import time
from pydantic import BaseModel, ConfigDict, model_validator

# Shared properties
class WorkingHoursBase(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    active: Optional[bool] = True

    @model_validator(mode='after')
    def validate_times(self) -> 'WorkingHoursBase':
        if self.start_time >= self.end_time:
            raise ValueError('End time must be after start time')
        return self

# Properties to receive via API on creation
class WorkingHoursCreate(WorkingHoursBase):
    professional_id: int

# Properties to receive via API on update
class WorkingHoursUpdate(BaseModel):
    day_of_week: Optional[int] = None
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
