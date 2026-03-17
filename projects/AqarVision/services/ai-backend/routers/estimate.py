"""Price estimation endpoint."""

from fastapi import APIRouter, Depends

from schemas.requests import EstimatePriceRequest, EstimatePriceResponse
from services.claude_client import complete
from services.errors import extract_json, safe_api_error
from routers._auth import verify_service_key

router = APIRouter(tags=["estimate"], dependencies=[Depends(verify_service_key)])

_SYSTEM = (
    "Tu es un expert en estimation immobilière en Algérie. "
    "À partir des caractéristiques d'un bien, estime une fourchette de prix. "
    "Tiens compte des prix du marché algérien par wilaya. "
    "Réponds en JSON strict : "
    '{"low": N, "mid": N, "high": N, "confidence": 0.X} '
    "où les prix sont en DZD."
)


@router.post("/estimate/price", response_model=EstimatePriceResponse)
async def estimate_price(req: EstimatePriceRequest) -> EstimatePriceResponse:
    parts = [
        f"Type : {req.property_type}",
        f"Annonce : {req.listing_type}",
        f"Wilaya : {req.wilaya_code}",
        f"Surface : {req.surface_m2} m²",
    ]
    if req.commune_code:
        parts.append(f"Commune : {req.commune_code}")
    if req.rooms:
        parts.append(f"Pièces : {req.rooms}")
    if req.details:
        extras = ", ".join(f"{k}: {v}" for k, v in req.details.items())
        parts.append(f"Détails : {extras}")

    try:
        text = await complete(
            system=_SYSTEM,
            user_message="\n".join(parts),
            temperature=0.4,
        )
        data = extract_json(text)
        return EstimatePriceResponse(
            estimated_price_low=data["low"],
            estimated_price_mid=data["mid"],
            estimated_price_high=data["high"],
            confidence=max(0.0, min(1.0, data.get("confidence", 0.5))),
        )
    except Exception as e:
        raise safe_api_error(e) from e
