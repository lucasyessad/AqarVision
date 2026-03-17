"""Async Anthropic client with retry logic and timeout."""

import logging
import time

import anthropic

from config import settings

logger = logging.getLogger(__name__)

_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    """Return a singleton async Anthropic client."""
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=settings.api_timeout,
            max_retries=settings.api_max_retries,
        )
    return _client


async def close_client() -> None:
    """Close the client on shutdown."""
    global _client
    if _client is not None:
        await _client.close()
        _client = None


async def complete(
    system: str,
    user_message: str,
    *,
    max_tokens: int | None = None,
    temperature: float = 0.7,
) -> str:
    """Send a single-turn message and return the text response."""
    client = get_client()
    start = time.monotonic()

    response = await client.messages.create(
        model=settings.model_id,
        max_tokens=max_tokens or settings.max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_message}],
        temperature=temperature,
    )

    elapsed = time.monotonic() - start
    logger.info(
        "Claude API call: model=%s tokens_in=%d tokens_out=%d duration=%.2fs",
        settings.model_id,
        response.usage.input_tokens,
        response.usage.output_tokens,
        elapsed,
    )

    block = response.content[0]
    if block.type == "text":
        return block.text
    return ""


async def complete_vision(
    system: str,
    content: list[dict],
    *,
    max_tokens: int | None = None,
    temperature: float = 0.5,
) -> str:
    """Send a vision message with images and return the text response."""
    client = get_client()
    start = time.monotonic()

    response = await client.messages.create(
        model=settings.model_id,
        max_tokens=max_tokens or settings.max_tokens,
        system=system,
        messages=[{"role": "user", "content": content}],
        temperature=temperature,
    )

    elapsed = time.monotonic() - start
    logger.info(
        "Claude Vision call: model=%s tokens_in=%d tokens_out=%d duration=%.2fs",
        settings.model_id,
        response.usage.input_tokens,
        response.usage.output_tokens,
        elapsed,
    )

    block = response.content[0]
    if block.type == "text":
        return block.text
    return ""
