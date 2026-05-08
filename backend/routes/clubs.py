from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import ClubCreate, ClubUpdate, ClubResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error

router = APIRouter(prefix="/api/clubs", tags=["Clubs"])

@router.get("", response_model=List[ClubResponse])
async def list_clubs(skip: int = 0, limit: int = 100):
    """List all clubs."""
    try:
        data = await supabase.get("Club", limit=limit, offset=skip)
        return data
    except Exception as e:
        await handle_db_error(e, "listing clubs")

@router.get("/{club_id}", response_model=ClubResponse)
async def get_club(club_id: int):
    """Get a club by ID."""
    try:
        data = await supabase.get_by_id("Club", club_id)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Club not found")
    except Exception as e:
        await handle_db_error(e, f"getting club {club_id}")

@router.post("", response_model=ClubResponse)
async def create_club(club: ClubCreate):
    """Create a new club."""
    try:
        data = await supabase.post("Club", {
            "clubName": club.clubName,
            "stadiumName": club.stadiumName,
            "stadiumCapacity": club.stadiumCapacity,
            "city": club.city,
            "country": club.country,
            "transferBudget": float(club.transferBudget),
            "yearFounded": club.yearFounded,
        })
        return data
    except Exception as e:
        await handle_db_error(e, "creating club")

@router.patch("/{club_id}", response_model=ClubResponse)
async def update_club(club_id: int, club: ClubUpdate):
    """Update a club by ID."""
    try:
        update_data = {k: v for k, v in club.model_dump().items() if v is not None}
        if not update_data:
            return await supabase.get_by_id("Club", club_id)
        
        # Convert Decimal to float
        if "transferBudget" in update_data:
            update_data["transferBudget"] = float(update_data["transferBudget"])
        
        data = await supabase.patch("Club", club_id, update_data)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Club not found")
    except Exception as e:
        await handle_db_error(e, f"updating club {club_id}")

@router.delete("/{club_id}")
async def delete_club(club_id: int):
    """Delete a club by ID."""
    try:
        await supabase.delete("Club", club_id)
        return {"message": "Club deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting club {club_id}")

@router.get("/{club_id}/squad", response_model=List[dict])
async def get_club_squad(club_id: int):
    """Get all players in a club."""
    try:
        # Need to query through Employment Contract or Player table
        # This assumes players have a clubId field
        data = await supabase.get("Player", filters={"clubId": club_id})
        return data
    except Exception as e:
        await handle_db_error(e, f"getting squad for club {club_id}")
