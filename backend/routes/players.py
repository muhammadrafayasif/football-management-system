from fastapi import APIRouter, HTTPException
from typing import List, Optional
import asyncio
from models import PlayerCreate, PlayerUpdate, PlayerResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error

router = APIRouter(prefix="/api/players", tags=["Players"])

@router.get("", response_model=List[PlayerResponse])
async def list_players(skip: int = 0, limit: int = 100, club_id: Optional[int] = None):
    """List all players with optional club filter."""
    try:
        filters = None
        if club_id:
            filters = {"clubId": club_id}
        data = await supabase.get("Player", filters=filters, limit=limit, offset=skip)
        person_tasks = [supabase.get_by_id("Person", player["personId"]) for player in data]
        people = await asyncio.gather(*person_tasks) if person_tasks else []
        return [{**person, **player} for person, player in zip(people, data)]
    except Exception as e:
        await handle_db_error(e, "listing players")

@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: int):
    """Get a player by ID."""
    try:
        # Query Person table first
        person_data = await supabase.get_by_id("Person", player_id)
        # Then query Player table
        player_data = await supabase.get_by_id("Player", player_id, select="*")
        # Merge data
        return {**person_data, **player_data}
    except ValueError:
        raise HTTPException(status_code=404, detail="Player not found")
    except Exception as e:
        await handle_db_error(e, f"getting player {player_id}")

@router.post("", response_model=PlayerResponse)
async def create_player(player: PlayerCreate):
    """Create a new player (creates Person and Player records)."""
    try:
        # First create Person record
        person_data = {
            "firstName": player.firstName,
            "lastName": player.lastName,
            "dateOfBirth": player.dateOfBirth,
            "nationality": player.nationality,
            "email": player.email,
            "phoneNumber": player.phoneNumber,
        }
        person = await supabase.post("Person", person_data)
        person_id = person.get("personId")

        # Then create Player record
        player_data = {
            "personId": person_id,
            "primaryPosition": player.primaryPosition,
            "preferredFoot": player.preferredFoot,
            "marketValue": float(player.marketValue),
            "jerseyNumber": player.jerseyNumber,
            "height": float(player.height),
            "weight": float(player.weight),
        }
        player_record = await supabase.post("Player", player_data)

        # Return merged data
        return {**person, **player_record}
    except Exception as e:
        await handle_db_error(e, "creating player")

@router.patch("/{player_id}", response_model=PlayerResponse)
async def update_player(player_id: int, player: PlayerUpdate):
    """Update a player's attributes."""
    try:
        update_data = {k: v for k, v in player.model_dump().items() if v is not None}
        if not update_data:
            return await get_player(player_id)
        
        # Convert Decimal to float for JSON
        for key in ["marketValue", "height", "weight"]:
            if key in update_data:
                update_data[key] = float(update_data[key])
        
        data = await supabase.patch("Player", player_id, update_data)
        person_data = await supabase.get_by_id("Person", player_id)
        return {**person_data, **data}
    except ValueError:
        raise HTTPException(status_code=404, detail="Player not found")
    except Exception as e:
        await handle_db_error(e, f"updating player {player_id}")

@router.delete("/{player_id}")
async def delete_player(player_id: int):
    """Delete a player (cascades to Person)."""
    try:
        await supabase.delete("Person", player_id)
        return {"message": "Player deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting player {player_id}")
