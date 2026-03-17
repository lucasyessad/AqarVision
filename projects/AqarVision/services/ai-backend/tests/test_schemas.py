"""Tests for request/response schemas."""

import pytest
from pydantic import ValidationError

from schemas.requests import (
    GenerateDescriptionRequest,
    AnalyzePhotosRequest,
    EstimatePriceRequest,
    TranslateRequest,
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


def test_analyze_photos_max_10():
    with pytest.raises(ValidationError):
        AnalyzePhotosRequest(
            image_urls=[f"https://example.com/{i}.jpg" for i in range(11)],
            listing_id="test-id",
        )


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


def test_translate_request():
    req = TranslateRequest(
        text="Belle villa avec jardin",
        source_locale="fr",
        target_locale="ar",
    )
    assert req.source_locale == "fr"
