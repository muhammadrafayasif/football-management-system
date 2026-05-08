from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date
from decimal import Decimal

class ContractCreate(BaseModel):
    personId: int
    startDate: date
    endDate: date
    signingDate: date
    contractStatus: Literal["Active", "Expired", "Terminated"]

class ContractUpdate(BaseModel):
    contractStatus: Optional[Literal["Active", "Expired", "Terminated"]] = None

class ContractResponse(BaseModel):
    contractId: int
    personId: int
    startDate: str
    endDate: str
    signingDate: str
    contractStatus: str

    class Config:
        from_attributes = True

class EmploymentContractCreate(BaseModel):
    personId: int
    clubId: int
    startDate: date
    endDate: date
    signingDate: date
    contractStatus: Literal["Active", "Expired", "Terminated"]
    weeklySalary: Decimal = Field(..., gt=0)
    releaseClause: Optional[Decimal] = Field(None, ge=0)
    signingBonus: Optional[Decimal] = Field(None, ge=0)
    performanceBonus: Optional[Decimal] = Field(None, ge=0)

class EmploymentContractResponse(BaseModel):
    contractId: int
    personId: int
    clubId: int
    startDate: str
    endDate: str
    signingDate: str
    contractStatus: str
    weeklySalary: str
    releaseClause: Optional[str]
    signingBonus: Optional[str]
    performanceBonus: Optional[str]

    class Config:
        from_attributes = True

class SponsorshipContractCreate(BaseModel):
    personId: int
    sponsorId: int
    startDate: date
    endDate: date
    signingDate: date
    contractStatus: Literal["Active", "Expired", "Terminated"]
    contractValue: Decimal = Field(..., gt=0)
    paymentFrequency: Literal["Monthly", "Quarterly", "Annual"]
    endorsementType: str = Field(..., min_length=1, max_length=50)

class SponsorshipContractResponse(BaseModel):
    contractId: int
    personId: int
    sponsorId: int
    startDate: str
    endDate: str
    signingDate: str
    contractStatus: str
    contractValue: str
    paymentFrequency: str
    endorsementType: str

    class Config:
        from_attributes = True
