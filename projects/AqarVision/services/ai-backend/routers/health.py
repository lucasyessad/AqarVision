"""Health check endpoint."""

import time

from fastapi import APIRouter

router = APIRouter(tags=["health"])

_start_time = time.monotonic()


@router.get("/healthz")
async def healthz() -> dict[str, object]:
    uptime = round(time.monotonic() - _start_time, 1)
    return {"status": "ok", "uptime_seconds": uptime}
