from fastapi import APIRouter, HTTPException
from typing import List
from models import SponsorCreate, SponsorUpdate, SponsorResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error

router = APIRouter(prefix="/api/sponsors", tags=["Sponsors"])

@router.get("", response_model=List[SponsorResponse])
async def list_sponsors(skip: int = 0, limit: int = 100):
    """List all sponsors."""
    try:
        data = await supabase.get("Sponsor", limit=limit, offset=skip)
        return data
    except Exception as e:
        await handle_db_error(e, "listing sponsors")

@router.get("/{sponsor_id}", response_model=SponsorResponse)
async def get_sponsor(sponsor_id: int):
    """Get a sponsor by ID."""
    try:
        data = await supabase.get_by_id("Sponsor", sponsor_id)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    except Exception as e:
        await handle_db_error(e, f"getting sponsor {sponsor_id}")

@router.post("", response_model=SponsorResponse)
async def create_sponsor(sponsor: SponsorCreate):
    """Create a new sponsor."""
    try:
        data = await supabase.post("Sponsor", sponsor.model_dump())
        return data
    except Exception as e:
        await handle_db_error(e, "creating sponsor")

@router.patch("/{sponsor_id}", response_model=SponsorResponse)
async def update_sponsor(sponsor_id: int, sponsor: SponsorUpdate):
    """Update a sponsor by ID."""
    try:
        update_data = {k: v for k, v in sponsor.model_dump().items() if v is not None}
        if not update_data:
            return await supabase.get_by_id("Sponsor", sponsor_id)
        
        data = await supabase.patch("Sponsor", sponsor_id, update_data)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Sponsor not found")
    except Exception as e:
        await handle_db_error(e, f"updating sponsor {sponsor_id}")

@router.delete("/{sponsor_id}")
async def delete_sponsor(sponsor_id: int):
    """Delete a sponsor by ID."""
    try:
        await supabase.delete("Sponsor", sponsor_id)
        return {"message": "Sponsor deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting sponsor {sponsor_id}")
