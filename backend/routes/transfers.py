from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import TransferCreate, TransferResponse
from services.supabase_service import supabase
from utils.errors import handle_db_error
from utils.validators import validate_transfer

router = APIRouter(prefix="/api/transfers", tags=["Transfers"])

@router.get("", response_model=List[TransferResponse])
async def list_transfers(skip: int = 0, limit: int = 100):
    """List all transfers."""
    try:
        data = await supabase.get("Transfer", limit=limit, offset=skip)
        return data
    except Exception as e:
        await handle_db_error(e, "listing transfers")

@router.get("/{transfer_id}", response_model=TransferResponse)
async def get_transfer(transfer_id: int):
    """Get a transfer by ID."""
    try:
        data = await supabase.get_by_id("Transfer", transfer_id)
        return data
    except ValueError:
        raise HTTPException(status_code=404, detail="Transfer not found")
    except Exception as e:
        await handle_db_error(e, f"getting transfer {transfer_id}")

@router.post("", response_model=TransferResponse)
async def create_transfer(transfer: TransferCreate):
    """Execute a transfer of a player."""
    try:
        # Validate buying and selling clubs are different
        validate_transfer(
            transfer.transferFee,
            None,  # Could fetch budget here if needed
            transfer.buyingClubId,
            transfer.sellingClubId
        )

        # Create transfer record
        transfer_data = {
            "personId": transfer.personId,
            "buyingClubId": transfer.buyingClubId,
            "sellingClubId": transfer.sellingClubId,
            "agentId": transfer.agentId,
            "transferFee": float(transfer.transferFee),
            "transferType": transfer.transferType,
        }
        data = await supabase.post("Transfer", transfer_data)
        return data
    except ValueError as e:
        if "club" in str(e).lower():
            raise HTTPException(status_code=400, detail=str(e))
        await handle_db_error(e, "creating transfer")
    except Exception as e:
        await handle_db_error(e, "creating transfer")

@router.delete("/{transfer_id}")
async def delete_transfer(transfer_id: int):
    """Delete a transfer record."""
    try:
        await supabase.delete("Transfer", transfer_id)
        return {"message": "Transfer deleted successfully"}
    except Exception as e:
        await handle_db_error(e, f"deleting transfer {transfer_id}")

@router.get("/player/{player_id}/history", response_model=List[TransferResponse])
async def get_player_transfer_history(player_id: int):
    """Get transfer history for a player."""
    try:
        data = await supabase.get("Transfer", filters={"personId": player_id})
        return data
    except Exception as e:
        await handle_db_error(e, f"getting transfer history for player {player_id}")
