from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gemini_api_key: str = ""
    # pin a concrete, currently-served model rather than a "-latest" alias that can
    # point at an overloaded endpoint
    gemini_model: str = "gemini-3.1-flash-lite"
    gemini_embed_model: str = "gemini-embedding-001"
    gemini_timeout_ms: int = 30000
    github_token: str = ""  # optional; lifts GitHub's 60 req/hr unauthenticated limit
    allowed_origins: str = "http://localhost:3000"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
