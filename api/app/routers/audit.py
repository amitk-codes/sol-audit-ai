from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services import auditor

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditRequest(BaseModel):
    source: str


@router.post("")
def audit(request: AuditRequest):
    if not request.source.strip():
        raise HTTPException(status_code=400, detail="source is empty")
    return StreamingResponse(
        auditor.audit_stream(request.source), media_type="text/plain; charset=utf-8"
    )
