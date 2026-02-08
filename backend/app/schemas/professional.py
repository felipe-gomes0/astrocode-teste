from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import User

# Shared properties
class ProfessionalBase(BaseModel):
    speciality: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    address: Optional[str] = None

# Properties to receive via API on creation
class ProfessionalCreate(ProfessionalBase):
    user_id: int
    speciality: str

# Properties to receive via API on update
class ProfessionalUpdate(ProfessionalBase):
    pass

# Properties shared by models stored in DB
class ProfessionalInDBBase(ProfessionalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Additional properties to return via API
class Professional(ProfessionalInDBBase):
    user: Optional[User] = None

# Additional properties stored in DB
class ProfessionalInDB(ProfessionalInDBBase):
    pass
