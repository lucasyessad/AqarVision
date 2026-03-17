"""Tests for service-to-service auth."""


def test_missing_service_key_returns_422(client):
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


def test_invalid_service_key_returns_401(client):
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
