from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import auditor

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditRequest(BaseModel):
    source: str


@router.post("")
def audit(request: AuditRequest):
    if not request.source.strip():
        raise HTTPException(status_code=400, detail="source is empty")
    try:
        return auditor.audit(request.source)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"audit failed: {exc}") from exc
