from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, model_validator

# Shared properties
class BlockBase(BaseModel):
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None

    @model_validator(mode='after')
    def validate_times(self) -> 'BlockBase':
        if self.start_time >= self.end_time:
            raise ValueError('End time must be after start time')
        return self

# Properties to receive via API on creation
class BlockCreate(BlockBase):
    professional_id: int

    def validate_future(self) -> 'BlockCreate':
        if self.start_time < datetime.now(timezone.utc):
             raise ValueError('Cannot block past times')
        return self

# Properties to receive via API on update
class BlockUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reason: Optional[str] = None

# Properties shared by models stored in DB
class BlockInDBBase(BlockBase):
    id: int
    professional_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Additional properties to return via API
class Block(BlockInDBBase):
    pass

# Additional properties stored in DB
class BlockInDB(BlockInDBBase):
    pass
