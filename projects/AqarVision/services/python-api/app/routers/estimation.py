"""POST /estimate — ML price estimation using scikit-learn GradientBoosting."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class EstimateInput(BaseModel):
    wilaya_code: str
    commune_id: int | None = None
    property_type: str
    surface_m2: float
    rooms: int | None = None
    bathrooms: int | None = None
    floor: int | None = None
    year_built: int | None = None
    has_parking: bool = False
    has_elevator: bool = False
    listing_type: str = "sale"


class EstimateResult(BaseModel):
    estimated_price: float
    price_range: dict  # { min, max }
    price_per_m2: float
    neighborhood_avg_m2: float | None
    confidence: float
    comparable_count: int


@router.post("", response_model=EstimateResult)
async def estimate_price(data: EstimateInput):
    # TODO: Load trained model from app/models/ and predict
    raise NotImplementedError("ML model not yet trained")
