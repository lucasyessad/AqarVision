"""Centralized error handling — safe error responses without leaking internals."""

import json
import logging
import re

from fastapi import HTTPException

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """Base exception for AI service errors."""

    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def safe_api_error(exc: Exception) -> HTTPException:
    """Convert exceptions to safe HTTP responses without leaking internals."""
    if isinstance(exc, AIServiceError):
        logger.error("AI service error: %s", exc.message)
        return HTTPException(status_code=exc.status_code, detail=exc.message)

    # Log the full error internally
    logger.error("Unexpected error: %s", exc, exc_info=True)

    # Return a generic message to the client
    return HTTPException(status_code=502, detail="AI service temporarily unavailable")


def extract_json(text: str) -> dict:
    """Extract JSON from Claude's response, handling markdown code blocks."""
    # Try direct parse first
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding the first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise AIServiceError("Failed to parse AI response as JSON")
