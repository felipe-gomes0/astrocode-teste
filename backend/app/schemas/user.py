from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserType

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    type: UserType
    active: Optional[bool] = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Properties to return via API
class ProfessionalInUser(BaseModel):
    id: int
    speciality: Optional[str] = None
    
class User(UserInDBBase):
    professional: Optional[ProfessionalInUser] = None

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
