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

_SYSTEM = (
    "You are a Solana smart-contract security reviewer performing an AI-assisted first-pass review. "
    "Review the given Rust / Anchor program source.\n\n"
    + _CHECKLIST
    + '\nOutput newline-delimited JSON (NDJSON): first a single line {"summary": string}, then one '
    'line per finding as {"title": string, "severity": "critical"|"high"|"medium"|"low"|"info", '
    '"category": string, "location": string, "description": string, "recommendation": string}, '
    "ordered by severity. Only report issues you can justify from the code — do not invent a finding "
    "where a check is actually satisfied. "
    "Output ONLY NDJSON — one JSON object per line, no markdown, no code fences."
)


def audit_stream(source: str):
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
        yield "\n" + json.dumps({"error": f"audit failed: {exc}"}) + "\n"
