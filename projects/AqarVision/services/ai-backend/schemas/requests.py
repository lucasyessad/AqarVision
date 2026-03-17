"""Request/response schemas for the AI API."""

from typing import Literal

from pydantic import BaseModel, Field

from config import SUPPORTED_LOCALES

Locale = Literal["fr", "ar", "en", "es"]


# --- Generate ---


class GenerateDescriptionRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    property_type: str = Field(min_length=1, max_length=50)
    listing_type: str = Field(min_length=1, max_length=20)
    wilaya: str = Field(min_length=1, max_length=100)
    commune: str | None = Field(default=None, max_length=100)
    surface_m2: float | None = Field(default=None, gt=0, le=100_000)
    rooms: int | None = Field(default=None, ge=1, le=100)
    bathrooms: int | None = Field(default=None, ge=0, le=50)
    price: int = Field(ge=0)
    currency: str = "DZD"
    details: dict[str, object] = Field(default_factory=dict)
    locale: Locale = "fr"


class GenerateDescriptionResponse(BaseModel):
    description: str
    locale: str


# --- Translate ---


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10_000)
    source_locale: Locale
    target_locale: Locale


class TranslateResponse(BaseModel):
    translated_text: str
    target_locale: str


# --- Analyze Photos ---


class AnalyzePhotosRequest(BaseModel):
    image_urls: list[str] = Field(min_length=1, max_length=10)
    listing_id: str = Field(min_length=1, max_length=100)


class AnalyzePhotosResponse(BaseModel):
    highlights: list[str]
    quality_score: int = Field(ge=0, le=100)
    suggestions: list[str]


# --- Estimate Price ---


class EstimatePriceRequest(BaseModel):
    property_type: str = Field(min_length=1, max_length=50)
    listing_type: str = Field(min_length=1, max_length=20)
    wilaya_code: str = Field(min_length=1, max_length=10)
    commune_code: str | None = Field(default=None, max_length=10)
    surface_m2: float = Field(gt=0, le=100_000)
    rooms: int | None = Field(default=None, ge=1, le=100)
    details: dict[str, object] = Field(default_factory=dict)


class EstimatePriceResponse(BaseModel):
    estimated_price_low: int
    estimated_price_mid: int
    estimated_price_high: int
    currency: str = "DZD"
    confidence: float = Field(ge=0, le=1)


# --- Translate Batch ---


class TranslateBatchRequest(BaseModel):
    texts: dict[str, str] = Field(
        min_length=1,
        max_length=10,
        description="Map of field_name → text to translate (e.g. {'title': '...', 'description': '...'})",
    )
    source_locale: Locale
    target_locale: Locale


class TranslateBatchResponse(BaseModel):
    translations: dict[str, str]
    target_locale: str


# --- Generate Individual Description ---


class GenerateDescriptionIndividualRequest(BaseModel):
    listing_type: str = Field(min_length=1, max_length=50)
    property_type: str = Field(min_length=1, max_length=50)
    current_price: int = Field(ge=0)
    surface_m2: float | None = Field(default=None, gt=0, le=100_000)
    rooms: int | None = Field(default=None, ge=1, le=100)
    bathrooms: int | None = Field(default=None, ge=0, le=50)
    floor: int | None = Field(default=None, ge=-5, le=200)
    wilaya_code: str = Field(min_length=1, max_length=10)
    commune_name: str | None = Field(default=None, max_length=100)
    details: dict[str, object] = Field(default_factory=dict)
    condition: str | None = Field(default=None, max_length=50)
    year_built: int | None = Field(default=None, ge=1800, le=2100)
    locale: Locale = "fr"


class GenerateDescriptionIndividualResponse(BaseModel):
    text: str
    locale: str


# --- Search Intent ---


class SearchIntentRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    locale: Locale = "fr"


class SearchIntentResponse(BaseModel):
    property_type: str | None = None
    listing_type: str | None = None
    wilaya: str | None = None
    commune: str | None = None
    min_price: int | None = None
    max_price: int | None = None
    min_surface: int | None = None
    max_surface: int | None = None
    rooms: int | None = None
    keywords: list[str] = []
    confidence: float = Field(default=0.0, ge=0, le=1)
