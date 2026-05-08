from pydantic import BaseModel, Field
from typing import Optional

class ManagerCreate(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)
    dateOfBirth: str  # ISO format date
    nationality: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., max_length=100)
    phoneNumber: str = Field(..., min_length=1, max_length=20)
    coachingLicense: str = Field(..., min_length=1, max_length=50)
    preferredFormation: str = Field(..., min_length=1, max_length=10)
    yearsOfExperience: int = Field(..., ge=0)
    clubId: Optional[int] = None

class ManagerUpdate(BaseModel):
    coachingLicense: Optional[str] = Field(None, min_length=1, max_length=50)
    preferredFormation: Optional[str] = Field(None, min_length=1, max_length=10)
    yearsOfExperience: Optional[int] = Field(None, ge=0)
    clubId: Optional[int] = None

class ManagerResponse(BaseModel):
    personId: int
    firstName: str
    lastName: str
    coachingLicense: str
    preferredFormation: str
    yearsOfExperience: int
    clubId: Optional[int]

    class Config:
        from_attributes = True
