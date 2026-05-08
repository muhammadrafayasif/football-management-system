from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import AgentCreate, AgentUpdate, AgentResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error

router = APIRouter(prefix="/api/agents", tags=["Agents"])

@router.get("", response_model=List[AgentResponse])
async def list_agents(skip: int = 0, limit: int = 100):
    """List all agents."""
    try:
        data = await supabase.get("Agent", limit=limit, offset=skip)
        return data
    except Exception as e:
        await handle_db_error(e, "listing agents")

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: int):
    """Get an agent by ID."""
    try:
        data = await supabase.get_by_id("Agent", agent_id)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Agent not found")
    except Exception as e:
        await handle_db_error(e, f"getting agent {agent_id}")

@router.post("", response_model=AgentResponse)
async def create_agent(agent: AgentCreate):
    """Create a new agent."""
    try:
        data = await supabase.post("Agent", agent.model_dump())
        return data
    except Exception as e:
        await handle_db_error(e, "creating agent")

@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(agent_id: int, agent: AgentUpdate):
    """Update an agent by ID."""
    try:
        update_data = {k: v for k, v in agent.model_dump().items() if v is not None}
        if not update_data:
            return await supabase.get_by_id("Agent", agent_id)
        
        # Convert Decimal to float
        if "commissionRate" in update_data:
            update_data["commissionRate"] = float(update_data["commissionRate"])
        
        data = await supabase.patch("Agent", agent_id, update_data)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Agent not found")
    except Exception as e:
        await handle_db_error(e, f"updating agent {agent_id}")

@router.delete("/{agent_id}")
async def delete_agent(agent_id: int):
    """Delete an agent by ID."""
    try:
        await supabase.delete("Agent", agent_id)
        return {"message": "Agent deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting agent {agent_id}")

@router.get("/{agent_id}/clients", response_model=List[dict])
async def get_agent_clients(agent_id: int):
    """Get all people represented by an agent."""
    try:
        data = await supabase.get("AgentPersonRepresents", filters={"agentId": agent_id})
        return data
    except Exception as e:
        await handle_db_error(e, f"getting clients for agent {agent_id}")
