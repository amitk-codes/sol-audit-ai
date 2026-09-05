# Deployment

Free-tier friendly. You only need a Google Gemini API key plus a host for each app. No database,
no auth.

## 1. Gemini key
aistudio.google.com → create an API key.

## 2. Backend — FastAPI
The `api/` folder ships a `Dockerfile` that binds `$PORT`, so it runs on any container host
(Google Cloud Run, Render, Railway, Fly, …).

Set these env vars / secrets:
- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (optional, default `gemini-flash-latest`)
- `GITHUB_TOKEN` (optional — lifts GitHub's unauthenticated rate limit when loading repos)
- `ALLOWED_ORIGINS` — your frontend URL

## 3. Frontend — Next.js on Vercel
Import the repo, set the root directory to `web/`, and set:
- `NEXT_PUBLIC_API_URL` — your backend URL

## 4. Connect
Put the Vercel URL into the backend's `ALLOWED_ORIGINS` so CORS allows the frontend. Done.
