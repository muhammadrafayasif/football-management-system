from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional

class PersonCreate(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)
    dateOfBirth: date
    nationality: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    phoneNumber: str = Field(..., min_length=1, max_length=20)

class PersonUpdate(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=50)
    lastName: Optional[str] = Field(None, min_length=1, max_length=50)
    nationality: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = Field(None, min_length=1, max_length=20)

class PersonResponse(BaseModel):
    personId: int
    firstName: str
    lastName: str
    dateOfBirth: date
    nationality: str
    email: str
    phoneNumber: str

    class Config:
        from_attributes = True
