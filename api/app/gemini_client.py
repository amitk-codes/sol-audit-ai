import logging
from functools import lru_cache

from google import genai
from google.genai import types

from app.config import settings

# the SDK logs an "automatic function calling" note on every call; we pass no tools
logging.getLogger("google_genai").setLevel(logging.ERROR)


@lru_cache
def get_gemini() -> genai.Client:
    """A Gemini client with a hard per-request timeout and the SDK's own bounded retry.

    The SDK retries transient 429/500/503/504s itself, so callers must NOT add a second
    retry layer.
    """
    return genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(
            timeout=settings.gemini_timeout_ms,
            retry_options=types.HttpRetryOptions(
                attempts=3,
                initial_delay=1.0,
                max_delay=8.0,
                http_status_codes=[429, 500, 503, 504],
            ),
        ),
    )
