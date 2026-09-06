import json

from google.genai import types

from app.config import settings
from app.gemini_client import get_gemini

MAX_SOURCE_CHARS = 200_000

_OUTLINE_SYSTEM = (
    "You explain Solana / Anchor programs. Given the Rust source, return JSON: "
    '{"overview": string, "instructions": [string]}. '
    "'overview' is 2-3 sentences on what the program does overall. "
    "'instructions' is the list of instruction / handler names (strings only)."
)


def outline(source: str) -> dict:
    response = get_gemini().models.generate_content(
        model=settings.gemini_model,
        contents=source[:MAX_SOURCE_CHARS],
        config=types.GenerateContentConfig(
            system_instruction=_OUTLINE_SYSTEM,
            response_mime_type="application/json",
            temperature=0.2,
        ),
    )
    return json.loads(response.text)


def instruction_stream(source: str, name: str):
    system = (
        f"Explain what the `{name}` instruction / handler in this Solana / Anchor program does, in "
        "plain English (2-4 sentences). Use light markdown. Do not repeat the program overview."
    )
    try:
        stream = get_gemini().models.generate_content_stream(
            model=settings.gemini_model,
            contents=source[:MAX_SOURCE_CHARS],
            config=types.GenerateContentConfig(system_instruction=system, temperature=0.2),
        )
        for chunk in stream:
            if chunk.text:
                yield chunk.text
    except Exception as exc:
        yield f"\n! failed: {exc}"
