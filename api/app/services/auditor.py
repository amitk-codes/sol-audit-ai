import json

from google.genai import types

from app.config import settings
from app.gemini_client import get_gemini

MAX_SOURCE_CHARS = 200_000

_CHECKLIST = """\
Check specifically for these Solana / Anchor vulnerability classes:
- Missing signer checks (is_signer) on privileged instructions
- Missing owner / account-ownership validation (type confusion, "account cosplay")
- Missing has_one / address constraints linking accounts
- Unchecked or arbitrary CPI (invoking a caller-supplied program)
- Integer overflow / underflow (unchecked arithmetic on balances or amounts)
- Missing PDA bump canonicalization or unsafe seeds
- Reinitialization / init_if_needed misuse
- Account-closing issues (revival attacks, lamport draining, missing close)
- Duplicate mutable account passing
- Unvalidated oracle data (e.g. Pyth staleness / confidence not checked)
- Authority / access-control gaps on admin instructions
- Rounding / precision loss in financial math
"""

_OUTLINE_SYSTEM = (
    "You are a Solana smart-contract security reviewer doing an AI-assisted first-pass review. "
    "Review the given Rust / Anchor program source.\n\n"
    + _CHECKLIST
    + '\nReturn JSON: {"summary": string, "findings": [{"title": string, '
    '"severity": "critical"|"high"|"medium"|"low"|"info", "category": string, "location": string}]}, '
    "findings ordered by severity. Do NOT include descriptions or fixes here — only the skeleton. "
    "Only report issues you can justify from the code."
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


def finding_stream(source: str, title: str, category: str, location: str):
    system = (
        f"In this Solana / Anchor program there is a security finding titled '{title}' "
        f"(category: {category}, location: {location}). Explain the issue in detail and how to fix "
        "it. Respond in markdown: a short description, then a line '**Fix:**' with the remedy."
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
