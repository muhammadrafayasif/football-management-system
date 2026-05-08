from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import date
from models import (
    EmploymentContractCreate, EmploymentContractResponse,
    SponsorshipContractCreate, SponsorshipContractResponse,
    ContractUpdate
)
from services.supabase_service import supabase
from utils.errors import handle_db_error
from utils.validators import validate_contract_dates

router = APIRouter(prefix="/api/contracts", tags=["Contracts"])

@router.get("", response_model=List[dict])
async def list_contracts(skip: int = 0, limit: int = 100, status: Optional[str] = None):
    """List all contracts with optional status filter."""
    try:
        filters = None
        if status:
            filters = {"contractStatus": status}
        data = await supabase.get("Contract", filters=filters, limit=limit, offset=skip)
        return data
    except Exception as e:
        await handle_db_error(e, "listing contracts")

@router.get("/{contract_id}", response_model=dict)
async def get_contract(contract_id: int):
    """Get a contract by ID."""
    try:
        data = await supabase.get_by_id("Contract", contract_id)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Contract not found")
    except Exception as e:
        await handle_db_error(e, f"getting contract {contract_id}")

@router.post("/employment", response_model=EmploymentContractResponse)
async def create_employment_contract(contract: EmploymentContractCreate):
    """Create an employment contract (player-club)."""
    try:
        validate_contract_dates(contract.signingDate, contract.startDate, contract.endDate)
        
        # Create base contract
        contract_data = {
            "personId": contract.personId,
            "startDate": str(contract.startDate),
            "endDate": str(contract.endDate),
            "signingDate": str(contract.signingDate),
            "contractStatus": contract.contractStatus.capitalize(),
        }
        base_contract = await supabase.post("Contract", contract_data)
        contract_id = base_contract.get("contractId")

        # Create employment contract
        emp_contract_data = {
            "contractId": contract_id,
            "clubId": contract.clubId,
            "weeklySalary": float(contract.weeklySalary),
            "releaseClause": float(contract.releaseClause) if contract.releaseClause else None,
            "signingBonus": float(contract.signingBonus) if contract.signingBonus else None,
            "performanceBonus": float(contract.performanceBonus) if contract.performanceBonus else None,
        }
        emp_contract = await supabase.post("EmploymentContract", emp_contract_data)
        
        return {**base_contract, **emp_contract}
    except ValueError as e:
        if "date" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        await handle_db_error(e, "creating employment contract")
    except Exception as e:
        await handle_db_error(e, "creating employment contract")

@router.post("/sponsorship", response_model=SponsorshipContractResponse)
async def create_sponsorship_contract(contract: SponsorshipContractCreate):
    """Create a sponsorship contract."""
    try:
        validate_contract_dates(contract.signingDate, contract.startDate, contract.endDate)
        
        # Create base contract
        contract_data = {
            "personId": contract.personId,
            "startDate": str(contract.startDate),
            "endDate": str(contract.endDate),
            "signingDate": str(contract.signingDate),
            "contractStatus": contract.contractStatus.capitalize(),
        }
        base_contract = await supabase.post("Contract", contract_data)
        contract_id = base_contract.get("contractId")

        # Create sponsorship contract
        spons_contract_data = {
            "contractId": contract_id,
            "sponsorId": contract.sponsorId,
            "contractValue": float(contract.contractValue),
            "paymentFrequency": contract.paymentFrequency,
            "endorsementType": contract.endorsementType,
        }
        spons_contract = await supabase.post("SponsorshipContract", spons_contract_data)
        
        return {**base_contract, **spons_contract}
    except ValueError as e:
        if "date" in str(e):
            raise HTTPException(status_code=400, detail=str(e))
        await handle_db_error(e, "creating sponsorship contract")
    except Exception as e:
        await handle_db_error(e, "creating sponsorship contract")

@router.patch("/{contract_id}", response_model=dict)
async def update_contract(contract_id: int, contract: ContractUpdate):
    """Update contract status."""
    try:
        update_data = {k: v for k, v in contract.model_dump().items() if v is not None}
        if not update_data:
            return await supabase.get_by_id("Contract", contract_id)
        
        data = await supabase.patch("Contract", contract_id, update_data)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Contract not found")
    except Exception as e:
        await handle_db_error(e, f"updating contract {contract_id}")

@router.delete("/{contract_id}")
async def delete_contract(contract_id: int):
    """Delete a contract by ID."""
    try:
        await supabase.delete("Contract", contract_id)
        return {"message": "Contract deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting contract {contract_id}")

@router.get("/person/{person_id}", response_model=List[dict])
async def get_person_contracts(person_id: int):
    """Get all contracts for a person."""
    try:
        data = await supabase.get("Contract", filters={"personId": person_id})
        return data
    except Exception as e:
        await handle_db_error(e, f"getting contracts for person {person_id}")
