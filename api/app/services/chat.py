import hashlib
import math

from google.genai import types

from app.config import settings
from app.gemini_client import get_gemini

WHOLE_CONTEXT_LIMIT = 30_000  # below this, send the whole program instead of retrieving
CHUNK_CHARS = 1500
TOP_K = 6
EMBED_DIMS = 768

_SYSTEM = (
    "You answer questions about a Solana / Anchor program using ONLY the provided code context. "
    "Be precise and cite instruction/function names. If the answer isn't in the code, say so."
)

# embeddings are expensive; reuse them across messages about the same contract
_embed_cache: dict[str, list[tuple[str, list[float]]]] = {}


def answer_stream(source: str, question: str, history: list[dict] | None = None):
    try:
        context = source if len(source) <= WHOLE_CONTEXT_LIMIT else _retrieve(source, question)

        turns: list[types.Content] = []
        for message in history or []:
            role = "model" if message.get("role") == "assistant" else "user"
            turns.append(
                types.Content(role=role, parts=[types.Part(text=message.get("content", ""))])
            )
        turns.append(
            types.Content(
                role="user",
                parts=[types.Part(text=f"Code context:\n{context}\n\nQuestion: {question}")],
            )
        )

        stream = get_gemini().models.generate_content_stream(
            model=settings.gemini_model,
            contents=turns,
            config=types.GenerateContentConfig(system_instruction=_SYSTEM, temperature=0.2),
        )
        for chunk in stream:
            if chunk.text:
                yield chunk.text
    except Exception as exc:
        yield f"\n\n! chat failed: {exc}"


def _retrieve(source: str, question: str) -> str:
    chunks = _embed_chunks(source)
    query_vec = _embed([question], "RETRIEVAL_QUERY")[0]
    ranked = sorted(chunks, key=lambda pair: _cosine(query_vec, pair[1]), reverse=True)
    return "\n\n".join(chunk for chunk, _ in ranked[:TOP_K])


def _embed_chunks(source: str) -> list[tuple[str, list[float]]]:
    key = hashlib.sha256(source.encode()).hexdigest()
    if key not in _embed_cache:
        if len(_embed_cache) > 32:
            _embed_cache.clear()
        chunks = _split(source)
        _embed_cache[key] = list(zip(chunks, _embed(chunks, "RETRIEVAL_DOCUMENT")))
    return _embed_cache[key]


def _split(source: str) -> list[str]:
    chunks, current, size = [], [], 0
    for line in source.splitlines():
        current.append(line)
        size += len(line) + 1
        if size >= CHUNK_CHARS:
            chunks.append("\n".join(current))
            current, size = [], 0
    if current:
        chunks.append("\n".join(current))
    return chunks


def _embed(texts: list[str], task_type: str) -> list[list[float]]:
    response = get_gemini().models.embed_content(
        model=settings.gemini_embed_model,
        contents=texts,
        config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=EMBED_DIMS),
    )
    return [embedding.values for embedding in response.embeddings]


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    return dot / norm if norm else 0.0
