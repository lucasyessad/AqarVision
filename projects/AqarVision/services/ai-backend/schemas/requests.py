"""Request/response schemas for the AI API."""

from pydantic import BaseModel, Field


class GenerateDescriptionRequest(BaseModel):
    title: str
    property_type: str
    listing_type: str
    wilaya: str
    commune: str | None = None
    surface_m2: float | None = None
    rooms: int | None = None
    bathrooms: int | None = None
    price: int
    currency: str = "DZD"
    details: dict[str, object] = Field(default_factory=dict)
    locale: str = "fr"


class GenerateDescriptionResponse(BaseModel):
    description: str
    locale: str


class TranslateRequest(BaseModel):
    text: str
    source_locale: str
    target_locale: str


class TranslateResponse(BaseModel):
    translated_text: str
    target_locale: str


class AnalyzePhotosRequest(BaseModel):
    image_urls: list[str] = Field(max_length=10)
    listing_id: str


class AnalyzePhotosResponse(BaseModel):
    highlights: list[str]
    quality_score: int
    suggestions: list[str]


class EstimatePriceRequest(BaseModel):
    property_type: str
    listing_type: str
    wilaya_code: str
    commune_code: str | None = None
    surface_m2: float
    rooms: int | None = None
    details: dict[str, object] = Field(default_factory=dict)


class EstimatePriceResponse(BaseModel):
    estimated_price_low: int
    estimated_price_mid: int
    estimated_price_high: int
    currency: str = "DZD"
    confidence: float
