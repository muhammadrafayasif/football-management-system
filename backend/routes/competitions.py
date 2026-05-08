from fastapi import APIRouter, HTTPException
from typing import List
from models import CompetitionCreate, CompetitionUpdate, CompetitionResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error

router = APIRouter(prefix="/api/competitions", tags=["Competitions"])

@router.get("", response_model=List[CompetitionResponse])
async def list_competitions(skip: int = 0, limit: int = 100):
    """List all competitions."""
    try:
        data = await supabase.get("Competition", limit=limit, offset=skip)
        return data
    except Exception as e:
        await handle_db_error(e, "listing competitions")

@router.get("/{comp_id}", response_model=CompetitionResponse)
async def get_competition(comp_id: int):
    """Get a competition by ID."""
    try:
        data = await supabase.get_by_id("Competition", comp_id)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Competition not found")
    except Exception as e:
        await handle_db_error(e, f"getting competition {comp_id}")

@router.post("", response_model=CompetitionResponse)
async def create_competition(comp: CompetitionCreate):
    """Create a new competition."""
    try:
        data = await supabase.post("Competition", {
            "compName": comp.compName,
            "compType": comp.compType,
            "country": comp.country,
            "prizePool": float(comp.prizePool) if comp.prizePool else None,
            "organizingBody": comp.organizingBody,
            "ranking": comp.ranking,
        })
        return data
    except Exception as e:
        await handle_db_error(e, "creating competition")

@router.patch("/{comp_id}", response_model=CompetitionResponse)
async def update_competition(comp_id: int, comp: CompetitionUpdate):
    """Update a competition by ID."""
    try:
        update_data = {k: v for k, v in comp.model_dump().items() if v is not None}
        if not update_data:
            return await supabase.get_by_id("Competition", comp_id)
        
        if "prizePool" in update_data and update_data["prizePool"] is not None:
            update_data["prizePool"] = float(update_data["prizePool"])
        
        data = await supabase.patch("Competition", comp_id, update_data)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Competition not found")
    except Exception as e:
        await handle_db_error(e, f"updating competition {comp_id}")

@router.delete("/{comp_id}")
async def delete_competition(comp_id: int):
    """Delete a competition by ID."""
    try:
        await supabase.delete("Competition", comp_id)
        return {"message": "Competition deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting competition {comp_id}")
