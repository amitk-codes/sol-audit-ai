import json

from google.genai import types

from app.config import settings
from app.gemini_client import get_gemini

MAX_SOURCE_CHARS = 200_000

_SYSTEM = (
    "You explain Solana / Anchor programs to developers. Given the program's Rust source, "
    "produce a concise plain-English explanation. "
    'Return JSON: {"overview": string, "instructions": [{"name": string, "summary": string}]}. '
    "'overview' is 2-3 sentences on what the program does overall. "
    "'instructions' lists each instruction / handler with a one-to-two sentence summary."
)


def explain(source: str) -> dict:
    client = get_gemini()
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=source[:MAX_SOURCE_CHARS],
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM,
            response_mime_type="application/json",
            temperature=0.2,
        ),
    )
    return json.loads(response.text)
