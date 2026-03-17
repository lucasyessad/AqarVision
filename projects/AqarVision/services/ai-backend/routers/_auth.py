"""Service-to-service authentication."""

from fastapi import Header, HTTPException

from config import settings


async def verify_service_key(
    x_service_key: str = Header(..., alias="X-Service-Key"),
) -> None:
    """Verify the service-to-service auth key."""
    if x_service_key != settings.service_key:
        raise HTTPException(status_code=401, detail="Invalid service key")
