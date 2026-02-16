from typing import Optional
from datetime import datetime
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
        
        # Validation for future dates (unless editing an old one, but usually blocking is for future)
        # However, blocking past dates might be valid for record keeping?
        # Requirement says: "Não pode bloquear horários no passado"
        # So we validate start_time > now
        if self.start_time < datetime.now():
             # We might want to allow a small buffer or just strictly future
             # But if I am editing a block that started 1 minute ago, this might fail.
             # Let's assume strict for creation.
             pass 
             # Actually, Pydantic validation runs on every model creation. 
             # If we fetch from DB, we don't want this validation to fail.
             # So we should put this in Create schema or check context.
        return self

# Properties to receive via API on creation
class BlockCreate(BlockBase):
    professional_id: int

    @model_validator(mode='after')
    def validate_future(self) -> 'BlockCreate':
        if self.start_time < datetime.now():
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
