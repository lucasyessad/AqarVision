"""Tests for request/response schemas."""

import pytest
from pydantic import ValidationError

from schemas.requests import (
    GenerateDescriptionRequest,
    AnalyzePhotosRequest,
    EstimatePriceRequest,
    TranslateRequest,
    SearchIntentRequest,
)


def test_generate_description_minimal():
    req = GenerateDescriptionRequest(
        title="Appartement F3",
        property_type="apartment",
        listing_type="sale",
        wilaya="Alger",
        price=5_000_000,
    )
    assert req.locale == "fr"
    assert req.currency == "DZD"
    assert req.details == {}


def test_generate_description_full():
    req = GenerateDescriptionRequest(
        title="Villa",
        property_type="villa",
        listing_type="rent",
        wilaya="Oran",
        commune="Bir El Djir",
        surface_m2=200.0,
        rooms=5,
        bathrooms=2,
        price=80_000,
        currency="DZD",
        details={"parking": True, "garden": True},
        locale="ar",
    )
    assert req.commune == "Bir El Djir"
    assert req.locale == "ar"


def test_generate_description_invalid_locale():
    with pytest.raises(ValidationError):
        GenerateDescriptionRequest(
            title="Test",
            property_type="apartment",
            listing_type="sale",
            wilaya="Alger",
            price=100,
            locale="xx",
        )


def test_generate_description_negative_price():
    with pytest.raises(ValidationError):
        GenerateDescriptionRequest(
            title="Test",
            property_type="apartment",
            listing_type="sale",
            wilaya="Alger",
            price=-100,
        )


def test_generate_description_empty_title():
    with pytest.raises(ValidationError):
        GenerateDescriptionRequest(
            title="",
            property_type="apartment",
            listing_type="sale",
            wilaya="Alger",
            price=100,
        )


def test_analyze_photos_max_10():
    with pytest.raises(ValidationError):
        AnalyzePhotosRequest(
            image_urls=[f"https://example.com/{i}.jpg" for i in range(11)],
            listing_id="test-id",
        )


def test_analyze_photos_min_1():
    with pytest.raises(ValidationError):
        AnalyzePhotosRequest(image_urls=[], listing_id="test-id")


def test_analyze_photos_valid():
    req = AnalyzePhotosRequest(
        image_urls=["https://example.com/1.jpg", "https://example.com/2.jpg"],
        listing_id="listing-123",
    )
    assert len(req.image_urls) == 2


def test_estimate_price_minimal():
    req = EstimatePriceRequest(
        property_type="apartment",
        listing_type="sale",
        wilaya_code="16",
        surface_m2=80.0,
    )
    assert req.commune_code is None
    assert req.rooms is None


def test_estimate_price_invalid_surface():
    with pytest.raises(ValidationError):
        EstimatePriceRequest(
            property_type="apartment",
            listing_type="sale",
            wilaya_code="16",
            surface_m2=-5.0,
        )


def test_translate_request():
    req = TranslateRequest(
        text="Belle villa avec jardin",
        source_locale="fr",
        target_locale="ar",
    )
    assert req.source_locale == "fr"


def test_translate_request_invalid_locale():
    with pytest.raises(ValidationError):
        TranslateRequest(
            text="Hello",
            source_locale="fr",
            target_locale="xx",
        )


def test_translate_request_empty_text():
    with pytest.raises(ValidationError):
        TranslateRequest(
            text="",
            source_locale="fr",
            target_locale="ar",
        )


def test_search_intent_minimal():
    req = SearchIntentRequest(query="appartement à Alger")
    assert req.locale == "fr"


def test_search_intent_short_query():
    with pytest.raises(ValidationError):
        SearchIntentRequest(query="a")
