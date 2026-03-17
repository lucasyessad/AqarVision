"""Application settings with validation and sensible defaults."""

from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings

SUPPORTED_LOCALES = ("fr", "ar", "en", "es")


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Auth ---
    anthropic_api_key: str
    service_key: str  # shared secret for Next.js → FastAPI auth

    # --- Claude API ---
    model_id: str = "claude-sonnet-4-20250514"
    max_tokens: int = Field(default=4096, ge=1, le=16384)
    api_timeout: float = Field(default=30.0, ge=5.0, le=120.0)
    api_max_retries: int = Field(default=2, ge=0, le=5)

    # --- Server ---
    cors_origins: list[str] = ["http://localhost:3000"]
    log_level: Literal["debug", "info", "warning", "error"] = "info"
    environment: Literal["development", "staging", "production"] = "development"

    # --- Rate limiting ---
    rate_limit_rpm: int = Field(default=60, ge=1, description="Requests per minute per service key")

    # --- Request limits ---
    max_text_length: int = Field(default=10_000, ge=100, le=100_000)
    max_image_urls: int = Field(default=10, ge=1, le=20)

    @field_validator("log_level", mode="before")
    @classmethod
    def normalize_log_level(cls, v: str) -> str:
        return v.lower().strip()

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def show_docs(self) -> bool:
        return not self.is_production

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()  # type: ignore[call-arg]
