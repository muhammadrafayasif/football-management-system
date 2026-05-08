from fastapi import HTTPException
from typing import Optional, Dict, Any

async def handle_db_error(error: Exception, context: str = "") -> None:
    """Handle database errors and return appropriate HTTP exceptions."""
    # Try to surface HTTP response body when available (httpx.HTTPStatusError)
    extra = ""
    try:
        resp = getattr(error, 'response', None)
        if resp is not None:
            try:
                body = resp.text
            except Exception:
                body = None
            if body:
                extra = f" - response: {body}"
    except Exception:
        extra = ""

    error_str = str(error).lower()
    
    if "unique violation" in error_str or "duplicate" in error_str:
        raise HTTPException(
            status_code=409,
            detail=f"Record already exists: {context}"
        )
    elif "foreign key violation" in error_str:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid reference: {context}"
        )
    elif "not found" in error_str:
        raise HTTPException(
            status_code=404,
            detail=f"Record not found: {context}"
        )
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(error)}{extra}"
        )

def filter_none_values(data: Dict[str, Any]) -> Dict[str, Any]:
    """Remove None values from a dictionary for PATCH operations."""
    return {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
