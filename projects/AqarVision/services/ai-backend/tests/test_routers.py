"""Tests for router endpoints with mocked Claude client."""

import json


def test_generate_description(authed_client, mock_complete):
    mock_complete.return_value = "Belle villa avec vue sur mer."
    response = authed_client.post(
        "/api/v1/generate/description",
        json={
            "title": "Villa F5",
            "property_type": "villa",
            "listing_type": "sale",
            "wilaya": "Alger",
            "price": 15_000_000,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Belle villa avec vue sur mer."
    assert data["locale"] == "fr"
    mock_complete.assert_awaited_once()


def test_translate(authed_client, mock_complete):
    mock_complete.return_value = "فيلا جميلة مع حديقة"
    response = authed_client.post(
        "/api/v1/translate",
        json={
            "text": "Belle villa avec jardin",
            "source_locale": "fr",
            "target_locale": "ar",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["translated_text"] == "فيلا جميلة مع حديقة"
    assert data["target_locale"] == "ar"


def test_estimate_price(authed_client, mock_complete):
    mock_complete.return_value = json.dumps(
        {"low": 8_000_000, "mid": 10_000_000, "high": 12_000_000, "confidence": 0.7}
    )
    response = authed_client.post(
        "/api/v1/estimate/price",
        json={
            "property_type": "apartment",
            "listing_type": "sale",
            "wilaya_code": "16",
            "surface_m2": 80.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_price_mid"] == 10_000_000
    assert data["confidence"] == 0.7


def test_estimate_price_markdown_json(authed_client, mock_complete):
    """Handles Claude wrapping JSON in markdown code blocks."""
    mock_complete.return_value = '```json\n{"low": 5000000, "mid": 7000000, "high": 9000000, "confidence": 0.6}\n```'
    response = authed_client.post(
        "/api/v1/estimate/price",
        json={
            "property_type": "apartment",
            "listing_type": "sale",
            "wilaya_code": "16",
            "surface_m2": 60.0,
        },
    )
    assert response.status_code == 200
    assert response.json()["estimated_price_mid"] == 7_000_000


def test_search_intent(authed_client, mock_complete):
    mock_complete.return_value = json.dumps(
        {
            "property_type": "apartment",
            "listing_type": "rent",
            "wilaya": "Alger",
            "commune": None,
            "min_price": None,
            "max_price": 50000,
            "min_surface": None,
            "max_surface": None,
            "rooms": 3,
            "keywords": ["F3", "centre-ville"],
            "confidence": 0.85,
        }
    )
    response = authed_client.post(
        "/api/v1/search/intent",
        json={"query": "F3 à louer centre Alger max 50000 DA"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["property_type"] == "apartment"
    assert data["wilaya"] == "Alger"
    assert data["confidence"] == 0.85


def test_analyze_photos(authed_client, mock_complete_vision):
    mock_complete_vision.return_value = json.dumps(
        {
            "highlights": ["Lumineux", "Bien entretenu", "Vue dégagée"],
            "quality_score": 75,
            "suggestions": ["Améliorer l'éclairage de la cuisine"],
        }
    )
    response = authed_client.post(
        "/api/v1/analyze/photos",
        json={
            "image_urls": ["https://example.com/1.jpg"],
            "listing_id": "listing-123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["highlights"]) == 3
    assert data["quality_score"] == 75


def test_generate_description_individual(authed_client, mock_complete):
    mock_complete.return_value = "Superbe appartement F3 au cœur d'Alger."
    response = authed_client.post(
        "/api/v1/generate/description/individual",
        json={
            "listing_type": "sale",
            "property_type": "apartment",
            "current_price": 8_000_000,
            "surface_m2": 75.0,
            "rooms": 3,
            "wilaya_code": "16",
            "commune_name": "Bab El Oued",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "Superbe" in data["text"]
    assert data["locale"] == "fr"
    mock_complete.assert_awaited_once()


def test_translate_batch(authed_client, mock_complete):
    mock_complete.return_value = json.dumps(
        {"title": "شقة F3 للبيع", "description": "شقة رائعة في وسط المدينة"}
    )
    response = authed_client.post(
        "/api/v1/translate/batch",
        json={
            "texts": {
                "title": "Appartement F3 à vendre",
                "description": "Superbe appartement en centre-ville",
            },
            "source_locale": "fr",
            "target_locale": "ar",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "title" in data["translations"]
    assert "description" in data["translations"]
    assert data["target_locale"] == "ar"
    # Only 1 Claude call for both fields
    mock_complete.assert_awaited_once()


def test_generate_description_claude_error(authed_client, mock_complete):
    """When Claude fails, return a safe 502 without leaking internals."""
    mock_complete.side_effect = RuntimeError("connection refused")
    response = authed_client.post(
        "/api/v1/generate/description",
        json={
            "title": "Test",
            "property_type": "apartment",
            "listing_type": "sale",
            "wilaya": "Alger",
            "price": 100,
        },
    )
    assert response.status_code == 502
    assert "connection refused" not in response.json()["detail"]
