import re

import httpx

from app.config import settings

GITHUB_API = "https://api.github.com"
MAX_FILES = 80

_URL_RE = re.compile(r"github\.com[/:]([^/]+)/([^/]+?)(?:/tree/([^/]+)(?:/(.*))?)?$")


def load_from_source(code: str) -> dict:
    return _build([{"path": "pasted.rs", "content": code}])


async def load_from_repo(repo_url: str) -> dict:
    owner, repo, ref, subpath = _parse_url(repo_url)
    headers = {"Accept": "application/vnd.github+json"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"

    async with httpx.AsyncClient(timeout=30) as client:
        if ref is None:
            info = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}", headers=headers)
            info.raise_for_status()
            ref = info.json()["default_branch"]

        tree = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/git/trees/{ref}?recursive=1", headers=headers
        )
        tree.raise_for_status()

        paths = [
            item["path"]
            for item in tree.json().get("tree", [])
            if item["type"] == "blob"
            and item["path"].endswith(".rs")
            and "/target/" not in item["path"]
            and (not subpath or item["path"].startswith(subpath))
        ][:MAX_FILES]

        files = []
        for path in paths:
            raw = await client.get(
                f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}"
            )
            if raw.status_code == 200:
                files.append({"path": path, "content": raw.text})

    if not files:
        raise ValueError("no Rust (.rs) files found in that repo")
    return _build(files)


def _parse_url(url: str) -> tuple[str, str, str | None, str]:
    match = _URL_RE.search(url.strip().removesuffix(".git"))
    if not match:
        raise ValueError("not a GitHub repo URL")
    owner, repo, ref, subpath = match.groups()
    return owner, repo, ref, (subpath or "")


def _build(files: list[dict]) -> dict:
    combined = "\n\n".join(f"// ==== {f['path']} ====\n{f['content']}" for f in files)
    return {"files": files, "combined": combined, "total_chars": len(combined)}
