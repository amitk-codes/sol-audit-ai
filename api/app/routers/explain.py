from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import explainer

router = APIRouter(prefix="/explain", tags=["explain"])


class ExplainRequest(BaseModel):
    source: str


@router.post("")
def explain(request: ExplainRequest):
    if not request.source.strip():
        raise HTTPException(status_code=400, detail="source is empty")
    try:
        return explainer.explain(request.source)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"explain failed: {exc}") from exc
