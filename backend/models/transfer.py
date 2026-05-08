from pydantic import BaseModel, Field
from typing import Optional, Literal
from decimal import Decimal

class TransferCreate(BaseModel):
    personId: int
    buyingClubId: int
    sellingClubId: Optional[int] = None
    agentId: Optional[int] = None
    transferFee: Decimal = Field(..., ge=0)
    transferType: Literal["Permanent", "Loan", "Free"]

class TransferResponse(BaseModel):
    transferId: int
    personId: int
    buyingClubId: int
    sellingClubId: Optional[int]
    agentId: Optional[int]
    transferFee: str
    transferType: str

    class Config:
        from_attributes = True
