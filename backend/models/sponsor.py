from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class SponsorCreate(BaseModel):
    sponsorName: str = Field(..., min_length=1, max_length=100)
    industry: str = Field(..., min_length=1, max_length=50)
    hqCountry: str = Field(..., min_length=1, max_length=50)
    contactEmail: EmailStr
    contactPhone: str = Field(..., min_length=1, max_length=20)
    website: Optional[str] = Field(None, max_length=200)

class SponsorUpdate(BaseModel):
    sponsorName: Optional[str] = Field(None, min_length=1, max_length=100)
    industry: Optional[str] = Field(None, min_length=1, max_length=50)
    hqCountry: Optional[str] = Field(None, min_length=1, max_length=50)
    contactEmail: Optional[EmailStr] = None
    contactPhone: Optional[str] = Field(None, min_length=1, max_length=20)
    website: Optional[str] = Field(None, max_length=200)

class SponsorResponse(BaseModel):
    sponsorId: int
    sponsorName: str
    industry: str
    hqCountry: str
    contactEmail: str
    contactPhone: str
    website: Optional[str]

    class Config:
        from_attributes = True
