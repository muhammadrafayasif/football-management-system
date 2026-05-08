from pydantic import BaseModel, Field
from typing import Optional, Literal
from decimal import Decimal

class PlayerCreate(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)
    dateOfBirth: str  # ISO format date
    nationality: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., max_length=100)
    phoneNumber: str = Field(..., min_length=1, max_length=20)
    primaryPosition: Literal["GK", "DEF", "MID", "FWD"]
    preferredFoot: Literal["Left", "Right", "Both"]
    marketValue: Decimal = Field(..., ge=0)
    jerseyNumber: int = Field(..., ge=1, le=99)
    height: Decimal = Field(..., gt=0)
    weight: Decimal = Field(..., gt=0)
    clubId: Optional[int] = None

class PlayerUpdate(BaseModel):
    primaryPosition: Optional[Literal["GK", "DEF", "MID", "FWD"]] = None
    preferredFoot: Optional[Literal["Left", "Right", "Both"]] = None
    marketValue: Optional[Decimal] = Field(None, ge=0)
    jerseyNumber: Optional[int] = Field(None, ge=1, le=99)
    height: Optional[Decimal] = Field(None, gt=0)
    weight: Optional[Decimal] = Field(None, gt=0)

class PlayerResponse(BaseModel):
    personId: int
    firstName: str
    lastName: str
    dateOfBirth: str
    nationality: str
    email: str
    phoneNumber: str
    primaryPosition: str
    preferredFoot: str
    marketValue: str
    jerseyNumber: int
    height: str
    weight: str

    class Config:
        from_attributes = True
