"""AqarVision Python API — FastAPI micro-service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import estimation, scraper, media, analytics, geocoding, nlp, pdf

app = FastAPI(
    title="AqarVision API",
    description="Micro-service Python pour estimation ML, scraping, analyse images, analytics, géocodage, NLP arabe, PDF.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(estimation.router, prefix="/estimate", tags=["estimation"])
app.include_router(scraper.router, prefix="/scrape", tags=["scraper"])
app.include_router(media.router, prefix="/media", tags=["media"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(geocoding.router, prefix="/geocode", tags=["geocoding"])
app.include_router(nlp.router, prefix="/nlp", tags=["nlp"])
app.include_router(pdf.router, prefix="/pdf", tags=["pdf"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "aqarvision-python-api"}
