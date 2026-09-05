from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import loader

router = APIRouter(prefix="/contract", tags=["contract"])


class LoadRequest(BaseModel):
    source: str | None = None
    repo_url: str | None = None


@router.post("/load")
async def load(request: LoadRequest):
    if request.source and request.source.strip():
        return loader.load_from_source(request.source)
    if request.repo_url and request.repo_url.strip():
        try:
            return await loader.load_from_repo(request.repo_url.strip())
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"could not load repo: {exc}") from exc
    raise HTTPException(status_code=400, detail="provide source or repo_url")
