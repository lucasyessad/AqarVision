from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    anthropic_api_key: str
    service_key: str  # shared secret for Next.js → FastAPI auth
    model_id: str = "claude-sonnet-4-20250514"
    max_tokens: int = 4096
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: str = "info"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()  # type: ignore[call-arg]
