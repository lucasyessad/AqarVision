"""AqarVision AI Backend — FastAPI service for Claude API operations."""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import generate, analyze, translate, estimate, search, health
from services.claude_client import close_client
from services.logging import generate_request_id, request_id_ctx, setup_logging

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "Starting AqarVision AI Backend (env=%s, model=%s)",
        settings.environment,
        settings.model_id,
    )
    yield
    logger.info("Shutting down — closing Anthropic client")
    await close_client()


app = FastAPI(
    title="AqarVision AI Backend",
    version="1.1.0",
    docs_url="/docs" if settings.show_docs else None,
    redoc_url="/redoc" if settings.show_docs else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next) -> Response:
    """Add request ID and log each request."""
    rid = generate_request_id()
    request_id_ctx.set(rid)

    start = time.monotonic()
    response: Response = await call_next(request)
    elapsed = round((time.monotonic() - start) * 1000, 1)

    response.headers["X-Request-Id"] = rid
    logger.info(
        "%s %s → %d (%sms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed,
    )
    return response


app.include_router(health.router)
app.include_router(generate.router, prefix="/api/v1")
app.include_router(analyze.router, prefix="/api/v1")
app.include_router(translate.router, prefix="/api/v1")
app.include_router(estimate.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
