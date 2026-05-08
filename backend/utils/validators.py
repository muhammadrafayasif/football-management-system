from fastapi import HTTPException
from datetime import date
from decimal import Decimal
from typing import Optional

def validate_date_range(start_date: date, end_date: date) -> None:
    """Validate that end_date is after start_date."""
    if end_date <= start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date"
        )

def validate_contract_dates(signing_date: date, start_date: date, end_date: date) -> None:
    """Validate contract dates are in correct order."""
    if signing_date > start_date:
        raise HTTPException(
            status_code=400,
            detail="Signing date cannot be after start date"
        )
    if end_date <= start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date"
        )

def validate_transfer(
    transfer_fee: Decimal,
    club_budget: Optional[Decimal],
    buying_club_id: int,
    selling_club_id: Optional[int]
) -> None:
    """Validate transfer is feasible."""
    if buying_club_id == selling_club_id:
        raise HTTPException(
            status_code=400,
            detail="Buying and selling clubs cannot be the same"
        )
    
    if club_budget is not None and transfer_fee > club_budget:
        raise HTTPException(
            status_code=400,
            detail="Insufficient transfer budget"
        )

def serialize_decimal(value: Optional[Decimal]) -> Optional[str]:
    """Convert Decimal to string for JSON serialization."""
    if value is None:
        return None
    return str(value)
