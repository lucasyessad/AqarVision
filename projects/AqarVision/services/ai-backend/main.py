"""AqarVision AI Backend — FastAPI service for Claude API operations."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import generate, analyze, translate, estimate, health

app = FastAPI(
    title="AqarVision AI Backend",
    version="1.0.0",
    docs_url="/docs" if settings.log_level == "debug" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(generate.router, prefix="/api/v1")
app.include_router(analyze.router, prefix="/api/v1")
app.include_router(translate.router, prefix="/api/v1")
app.include_router(estimate.router, prefix="/api/v1")
