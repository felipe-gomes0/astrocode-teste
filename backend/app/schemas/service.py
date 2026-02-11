from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

# Shared properties
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration: int
    price: Optional[Decimal] = None
    active: Optional[bool] = True

# Properties to receive via API on creation
class ServiceCreate(ServiceBase):
    professional_id: int

# Properties to receive via API on update
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[Decimal] = None
    active: Optional[bool] = None

# Properties shared by models stored in DB
class ServiceInDBBase(ServiceBase):
    id: int
    professional_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Additional properties to return via API
class Service(ServiceInDBBase):
    pass

# Additional properties stored in DB
class ServiceInDB(ServiceInDBBase):
    pass
