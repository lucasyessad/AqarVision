"""Shared test fixtures."""

import os

# Set env vars before any app imports
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")
os.environ.setdefault("SERVICE_KEY", "test-service-key")
os.environ.setdefault("ENVIRONMENT", "development")

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from main import app


@pytest.fixture
def client():
    """Test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def authed_client(client):
    """Test client with valid service key header."""

    class AuthedClient:
        def __init__(self, c):
            self._client = c
            self._headers = {"X-Service-Key": "test-service-key"}

        def post(self, url, **kwargs):
            headers = {**self._headers, **kwargs.pop("headers", {})}
            return self._client.post(url, headers=headers, **kwargs)

        def get(self, url, **kwargs):
            headers = {**self._headers, **kwargs.pop("headers", {})}
            return self._client.get(url, headers=headers, **kwargs)

    return AuthedClient(client)


@pytest.fixture
def mock_complete():
    """Mock the Claude complete function."""
    with patch("services.claude_client.complete", new_callable=AsyncMock) as m:
        yield m


@pytest.fixture
def mock_complete_vision():
    """Mock the Claude complete_vision function."""
    with patch("services.claude_client.complete_vision", new_callable=AsyncMock) as m:
        yield m
