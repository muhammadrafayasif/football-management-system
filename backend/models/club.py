from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class ClubCreate(BaseModel):
    clubName: str = Field(..., min_length=1, max_length=100)
    stadiumName: str = Field(..., min_length=1, max_length=100)
    stadiumCapacity: int = Field(..., gt=0)
    city: str = Field(..., min_length=1, max_length=50)
    country: str = Field(..., min_length=1, max_length=50)
    transferBudget: Decimal = Field(..., ge=0)
    yearFounded: int = Field(..., ge=1800, le=2100)

class ClubUpdate(BaseModel):
    clubName: Optional[str] = Field(None, min_length=1, max_length=100)
    stadiumName: Optional[str] = Field(None, min_length=1, max_length=100)
    stadiumCapacity: Optional[int] = Field(None, gt=0)
    city: Optional[str] = Field(None, min_length=1, max_length=50)
    country: Optional[str] = Field(None, min_length=1, max_length=50)
    transferBudget: Optional[Decimal] = Field(None, ge=0)
    yearFounded: Optional[int] = Field(None, ge=1800, le=2100)

class ClubResponse(BaseModel):
    clubId: int
    clubName: str
    stadiumName: str
    stadiumCapacity: int
    city: str
    country: str
    transferBudget: str
    yearFounded: int

    class Config:
        from_attributes = True
