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
    "You are a Solana smart-contract security reviewer performing an AI-assisted first-pass review "
    "(not a certified audit). Review the given Rust / Anchor program source.\n\n"
    + _CHECKLIST
    + '\nReturn JSON: {"summary": string, "findings": [{"title": string, '
    '"severity": "critical"|"high"|"medium"|"low"|"info", "category": string, '
    '"location": string, "description": string, "recommendation": string}]}. '
    "Only report issues you can justify from the code — do not invent a finding where a check is "
    "actually satisfied. 'location' should cite the file/function. Order findings by severity."
)


def audit(source: str) -> dict:
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
