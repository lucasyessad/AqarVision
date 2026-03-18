"""POST /geocode/batch — Batch geocoding using GeoPy."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class GeocodeBatchInput(BaseModel):
    addresses: list[dict]  # [{ id, address }]


class GeocodeResult(BaseModel):
    results: list[dict]  # [{ id, lat, lng, confidence }]
    failed: list[str]


@router.post("/batch", response_model=GeocodeResult)
async def geocode_batch(data: GeocodeBatchInput):
    # TODO: Implement GeoPy Nominatim geocoding
    raise NotImplementedError("Geocoder not yet implemented")
