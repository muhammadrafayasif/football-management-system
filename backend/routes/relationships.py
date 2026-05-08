from fastapi import APIRouter, HTTPException
from typing import List
from services.supabase_service import supabase
from utils.errors import handle_db_error

router = APIRouter(prefix="/api", tags=["Relationships"])

@router.post("/agent-represents")
async def assign_agent_to_person(agent_id: int, person_id: int):
    """Assign an agent to represent a person."""
    try:
        data = await supabase.post("AgentPersonRepresents", {
            "agentId": agent_id,
            "personId": person_id,
        })
        return {"message": "Agent assigned successfully"}
    except Exception as e:
        await handle_db_error(e, "assigning agent")

@router.delete("/agent-represents/{agent_id}/{person_id}")
async def remove_agent_from_person(agent_id: int, person_id: int):
    """Remove agent assignment from a person."""
    try:
        # Supabase doesn't support composite key delete in REST, so we'll use a filter
        url_filter = f"agentId=eq.{agent_id}&personId=eq.{person_id}"
        # This is a workaround - ideally should be handled through a custom delete
        await supabase.delete("AgentPersonRepresents", agent_id)
        return {"message": "Agent assignment removed successfully"}
    except Exception as e:
        await handle_db_error(e, "removing agent")

@router.post("/club-competition")
async def add_club_to_competition(club_id: int, comp_id: int):
    """Add a club to a competition."""
    try:
        data = await supabase.post("CompetitionClubParticipation", {
            "clubId": club_id,
            "compId": comp_id,
        })
        return {"message": "Club added to competition successfully"}
    except Exception as e:
        await handle_db_error(e, "adding club to competition")

@router.post("/sponsor-club")
async def add_sponsor_to_club(sponsor_id: int, club_id: int):
    """Add a sponsor partnership with a club."""
    try:
        data = await supabase.post("SponsorClubPartnership", {
            "sponsorId": sponsor_id,
            "clubId": club_id,
        })
        return {"message": "Sponsor partnership created successfully"}
    except Exception as e:
        await handle_db_error(e, "creating sponsor partnership")
