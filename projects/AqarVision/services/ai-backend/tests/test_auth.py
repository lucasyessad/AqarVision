"""Tests for service-to-service auth."""

import os

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")
os.environ.setdefault("SERVICE_KEY", "test-service-key")

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_missing_service_key_returns_422():
    response = client.post(
        "/api/v1/generate/description",
        json={
            "title": "Test",
            "property_type": "apartment",
            "listing_type": "sale",
            "wilaya": "Alger",
            "price": 5000000,
        },
    )
    assert response.status_code == 422


def test_invalid_service_key_returns_401():
    response = client.post(
        "/api/v1/generate/description",
        json={
            "title": "Test",
            "property_type": "apartment",
            "listing_type": "sale",
            "wilaya": "Alger",
            "price": 5000000,
        },
        headers={"X-Service-Key": "wrong-key"},
    )
    assert response.status_code == 401
