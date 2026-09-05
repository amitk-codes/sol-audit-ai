from functools import lru_cache

from google import genai

from app.config import settings


@lru_cache
def get_gemini() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)
