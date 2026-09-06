from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services import auditor

router = APIRouter(prefix="/audit", tags=["audit"])


class SourceRequest(BaseModel):
    source: str


class FindingRequest(BaseModel):
    source: str
    title: str
    category: str = ""
    location: str = ""


@router.post("/outline")
def outline(request: SourceRequest):
    if not request.source.strip():
        raise HTTPException(status_code=400, detail="source is empty")
    try:
        return auditor.outline(request.source)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"audit failed: {exc}") from exc


@router.post("/finding")
def finding(request: FindingRequest):
    return StreamingResponse(
        auditor.finding_stream(request.source, request.title, request.category, request.location),
        media_type="text/plain; charset=utf-8",
    )
