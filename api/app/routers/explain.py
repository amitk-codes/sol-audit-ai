from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services import explainer

router = APIRouter(prefix="/explain", tags=["explain"])


class SourceRequest(BaseModel):
    source: str


class InstructionRequest(BaseModel):
    source: str
    name: str


@router.post("/outline")
def outline(request: SourceRequest):
    if not request.source.strip():
        raise HTTPException(status_code=400, detail="source is empty")
    try:
        return explainer.outline(request.source)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"explain failed: {exc}") from exc


@router.post("/instruction")
def instruction(request: InstructionRequest):
    return StreamingResponse(
        explainer.instruction_stream(request.source, request.name),
        media_type="text/plain; charset=utf-8",
    )
