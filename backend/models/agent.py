from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from decimal import Decimal

class AgentCreate(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)
    agencyName: Optional[str] = Field(None, max_length=100)
    licenseNumber: str = Field(..., min_length=1, max_length=50)
    commissionRate: Decimal = Field(..., ge=0, le=100)
    email: EmailStr
    phoneNumber: str = Field(..., min_length=1, max_length=20)

class AgentUpdate(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=50)
    lastName: Optional[str] = Field(None, min_length=1, max_length=50)
    agencyName: Optional[str] = Field(None, max_length=100)
    commissionRate: Optional[Decimal] = Field(None, ge=0, le=100)
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = Field(None, min_length=1, max_length=20)

class AgentResponse(BaseModel):
    agentId: int
    firstName: str
    lastName: str
    agencyName: Optional[str]
    licenseNumber: str
    commissionRate: str
    email: str
    phoneNumber: str

    class Config:
        from_attributes = True
