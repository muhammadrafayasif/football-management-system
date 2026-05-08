from pydantic import BaseModel, Field
from typing import Optional, Literal
from decimal import Decimal

class CompetitionCreate(BaseModel):
    compName: str = Field(..., min_length=1, max_length=100)
    compType: Literal["League", "Cup", "Continental"]
    country: Optional[str] = Field(None, max_length=50)
    prizePool: Optional[Decimal] = Field(None, ge=0)
    organizingBody: str = Field(..., min_length=1, max_length=100)
    ranking: Optional[int] = None

class CompetitionUpdate(BaseModel):
    compName: Optional[str] = Field(None, min_length=1, max_length=100)
    compType: Optional[Literal["League", "Cup", "Continental"]] = None
    country: Optional[str] = Field(None, max_length=50)
    prizePool: Optional[Decimal] = Field(None, ge=0)
    organizingBody: Optional[str] = Field(None, min_length=1, max_length=100)
    ranking: Optional[int] = None

class CompetitionResponse(BaseModel):
    compId: int
    compName: str
    compType: str
    country: Optional[str]
    prizePool: Optional[str]
    organizingBody: str
    ranking: Optional[int]

    class Config:
        from_attributes = True
