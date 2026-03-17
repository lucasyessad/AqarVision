"""Photo analysis endpoint using Claude Vision."""

from fastapi import APIRouter, Depends

from schemas.requests import AnalyzePhotosRequest, AnalyzePhotosResponse
from services.claude_client import complete_vision
from services.errors import extract_json, safe_api_error
from routers._auth import verify_service_key

router = APIRouter(tags=["analyze"], dependencies=[Depends(verify_service_key)])

_SYSTEM = (
    "Tu es un expert en photographie immobilière algérienne. "
    "Analyse les photos d'une annonce immobilière et fournis : "
    "1) highlights : liste de 3-5 points forts visuels, "
    "2) quality_score : score de qualité photo de 0 à 100, "
    "3) suggestions : liste de 1-3 améliorations possibles. "
    'Réponds en JSON strict : {"highlights": [...], "quality_score": N, "suggestions": [...]}'
)


@router.post("/analyze/photos", response_model=AnalyzePhotosResponse)
async def analyze_photos(req: AnalyzePhotosRequest) -> AnalyzePhotosResponse:
    content: list[dict] = [
        {"type": "text", "text": f"Annonce {req.listing_id}. Analyse ces photos :"}
    ]
    for url in req.image_urls:
        content.append({"type": "image", "source": {"type": "url", "url": url}})

    try:
        text = await complete_vision(system=_SYSTEM, content=content, temperature=0.5)
        data = extract_json(text)
        return AnalyzePhotosResponse(
            highlights=data.get("highlights", []),
            quality_score=max(0, min(100, data.get("quality_score", 50))),
            suggestions=data.get("suggestions", []),
        )
    except Exception as e:
        raise safe_api_error(e) from e
