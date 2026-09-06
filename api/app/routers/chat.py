from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services import chat as chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    source: str
    question: str
    history: list[ChatMessage] = []


@router.post("")
def chat(request: ChatRequest):
    if not request.source.strip() or not request.question.strip():
        raise HTTPException(status_code=400, detail="source and question are required")
    return StreamingResponse(
        chat_service.answer_stream(
            request.source,
            request.question,
            [message.model_dump() for message in request.history],
        ),
        media_type="text/plain; charset=utf-8",
    )
