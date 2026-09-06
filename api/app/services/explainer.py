import json

from google.genai import types

from app.config import settings
from app.gemini_client import get_gemini

MAX_SOURCE_CHARS = 200_000

_SYSTEM = (
    "You explain Solana / Anchor programs to developers. Given the program's Rust source, "
    'output newline-delimited JSON (NDJSON): first a single line {"overview": string} '
    "(2-3 sentences on what the program does overall), then one line per instruction / handler "
    'as {"name": string, "summary": string}. '
    "Output ONLY NDJSON — one JSON object per line, no markdown, no code fences."
)


def explain_stream(source: str):
    try:
        stream = get_gemini().models.generate_content_stream(
            model=settings.gemini_model,
            contents=source[:MAX_SOURCE_CHARS],
            config=types.GenerateContentConfig(system_instruction=_SYSTEM, temperature=0.2),
        )
        for chunk in stream:
            if chunk.text:
                yield chunk.text
    except Exception as exc:
        yield "\n" + json.dumps({"error": f"explain failed: {exc}"}) + "\n"
