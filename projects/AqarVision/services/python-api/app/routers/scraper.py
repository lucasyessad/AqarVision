"""POST /scrape — Market data scraping (admin only, auth token required)."""

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.config import settings

router = APIRouter()


class ScrapeInput(BaseModel):
    source: str = "ouedkniss"
    wilaya_code: str
    property_type: str


class ScrapeResult(BaseModel):
    listings_found: int
    avg_price_m2: float | None
    stored: bool


@router.post("", response_model=ScrapeResult)
async def scrape_market(data: ScrapeInput, x_api_secret: str = Header(...)):
    if x_api_secret != settings.PYTHON_API_SECRET:
        raise HTTPException(status_code=403, detail="Invalid API secret")
    # TODO: Implement Scrapy/BS4 scraping logic
    raise NotImplementedError("Scraper not yet implemented")
