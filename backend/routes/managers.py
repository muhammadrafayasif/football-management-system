from fastapi import APIRouter, HTTPException
from typing import List, Optional
import asyncio
from models import ManagerCreate, ManagerUpdate, ManagerResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error

router = APIRouter(prefix="/api/managers", tags=["Managers"])


def merge_manager_records(person: dict, manager: dict) -> dict:
    return {**person, **manager}


@router.get("", response_model=List[ManagerResponse])
async def list_managers(skip: int = 0, limit: int = 100):
    """List all managers."""
    try:
        manager_rows = await supabase.get("Manager", limit=limit, offset=skip)
        if not manager_rows:
            return []

        person_tasks = [supabase.get_by_id("Person", manager_row["personId"]) for manager_row in manager_rows]
        person_rows = await asyncio.gather(*person_tasks)
        return [merge_manager_records(person, manager) for person, manager in zip(person_rows, manager_rows)]
    except Exception as e:
        await handle_db_error(e, "listing managers")


@router.get("/{manager_id}", response_model=ManagerResponse)
async def get_manager(manager_id: int):
    """Get a manager by ID."""
    try:
        person_data = await supabase.get_by_id("Person", manager_id)
        manager_data = await supabase.get_by_id("Manager", manager_id)
        return merge_manager_records(person_data, manager_data)
    except ValueError:
        raise HTTPException(status_code=404, detail="Manager not found")
    except Exception as e:
        await handle_db_error(e, f"getting manager {manager_id}")


@router.post("", response_model=ManagerResponse)
async def create_manager(manager: ManagerCreate):
    """Create a new manager (creates Person and Manager records)."""
    try:
        # First create Person record
        person_data = {
            "firstName": manager.firstName,
            "lastName": manager.lastName,
            "dateOfBirth": manager.dateOfBirth,
            "nationality": manager.nationality,
            "email": manager.email,
            "phoneNumber": manager.phoneNumber,
        }
        person = await supabase.post("Person", person_data)
        person_id = person.get("personId")

        # Then create Manager record
        manager_data = {
            "personId": person_id,
            "coachingLicense": manager.coachingLicense,
            "preferredFormation": manager.preferredFormation,
            "yearsOfExperience": manager.yearsOfExperience,
            "clubId": manager.clubId,
        }
        manager_record = await supabase.post("Manager", manager_data)
        return merge_manager_records(person, manager_record)
    except Exception as e:
        await handle_db_error(e, "creating manager")


@router.patch("/{manager_id}", response_model=ManagerResponse)
async def update_manager(manager_id: int, manager: ManagerUpdate):
    """Update a manager's attributes."""
    try:
        update_data = {k: v for k, v in manager.model_dump().items() if v is not None}
        if not update_data:
            person_data = await supabase.get_by_id("Person", manager_id)
            manager_data = await supabase.get_by_id("Manager", manager_id)
            return merge_manager_records(person_data, manager_data)
        
        data = await supabase.patch("Manager", manager_id, update_data)
        person_data = await supabase.get_by_id("Person", manager_id)
        return merge_manager_records(person_data, data)
    except ValueError:
        raise HTTPException(status_code=404, detail="Manager not found")
    except Exception as e:
        await handle_db_error(e, f"updating manager {manager_id}")


@router.delete("/{manager_id}")
async def delete_manager(manager_id: int):
    """Delete a manager (cascades to Person)."""
    try:
        await supabase.delete("Person", manager_id)
        return {"message": "Manager deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting manager {manager_id}")
