from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services import explainer

router = APIRouter(prefix="/explain", tags=["explain"])


class ExplainRequest(BaseModel):
    source: str


@router.post("")
def explain(request: ExplainRequest):
    if not request.source.strip():
        raise HTTPException(status_code=400, detail="source is empty")
    return StreamingResponse(
        explainer.explain_stream(request.source), media_type="text/plain; charset=utf-8"
    )
