"""Thin wrapper around the Anthropic Python SDK."""

import anthropic

from config import settings


_client: anthropic.Anthropic | None = None


def get_client() -> anthropic.Anthropic:
    """Return a singleton Anthropic client."""
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


async def complete(
    system: str,
    user_message: str,
    *,
    max_tokens: int | None = None,
    temperature: float = 0.7,
) -> str:
    """Send a single-turn message and return the text response."""
    client = get_client()
    response = client.messages.create(
        model=settings.model_id,
        max_tokens=max_tokens or settings.max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_message}],
        temperature=temperature,
    )
    block = response.content[0]
    if block.type == "text":
        return block.text
    return ""
