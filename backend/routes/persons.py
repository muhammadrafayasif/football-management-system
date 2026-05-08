from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import PersonCreate, PersonUpdate, PersonResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error, filter_none_values

router = APIRouter(prefix="/api/persons", tags=["Persons"])

@router.get("", response_model=List[PersonResponse])
async def list_persons(skip: int = 0, limit: int = 100):
    """List all persons with optional pagination."""
    try:
        data = await supabase.get("Person", limit=limit, offset=skip)
        return data
    except Exception as e:
        await handle_db_error(e, "listing persons")

@router.get("/{person_id}", response_model=PersonResponse)
async def get_person(person_id: int):
    """Get a person by ID."""
    try:
        data = await supabase.get_by_id("Person", person_id)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Person not found")
    except Exception as e:
        await handle_db_error(e, f"getting person {person_id}")

@router.post("", response_model=PersonResponse)
async def create_person(person: PersonCreate):
    """Create a new person."""
    try:
        data = await supabase.post("Person", person.model_dump())
        return data
    except Exception as e:
        await handle_db_error(e, "creating person")

@router.patch("/{person_id}", response_model=PersonResponse)
async def update_person(person_id: int, person: PersonUpdate):
    """Update a person by ID."""
    try:
        update_data = {k: v for k, v in person.model_dump().items() if v is not None}
        if not update_data:
            return await supabase.get_by_id("Person", person_id)
        data = await supabase.patch("Person", person_id, update_data)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Person not found")
    except Exception as e:
        await handle_db_error(e, f"updating person {person_id}")

@router.delete("/{person_id}")
async def delete_person(person_id: int):
    """Delete a person by ID."""
    try:
        await supabase.delete("Person", person_id)
        return {"message": "Person deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting person {person_id}")
