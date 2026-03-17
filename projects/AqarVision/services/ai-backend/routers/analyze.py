"""Photo analysis endpoint using Claude Vision."""

from fastapi import APIRouter, Depends, HTTPException

from config import settings
from schemas.requests import AnalyzePhotosRequest, AnalyzePhotosResponse
from services.claude_client import get_client
from routers._auth import verify_service_key

router = APIRouter(tags=["analyze"], dependencies=[Depends(verify_service_key)])

_SYSTEM = (
    "Tu es un expert en photographie immobilière algérienne. "
    "Analyse les photos d'une annonce immobilière et fournis : "
    "1) highlights : liste de 3-5 points forts visuels, "
    "2) quality_score : score de qualité photo de 0 à 100, "
    "3) suggestions : liste de 1-3 améliorations possibles. "
    "Réponds en JSON strict : {\"highlights\": [...], \"quality_score\": N, \"suggestions\": [...]}"
)


@router.post("/analyze/photos", response_model=AnalyzePhotosResponse)
async def analyze_photos(req: AnalyzePhotosRequest) -> AnalyzePhotosResponse:
    content: list[dict] = [{"type": "text", "text": f"Annonce {req.listing_id}. Analyse ces photos :"}]
    for url in req.image_urls:
        content.append(
            {"type": "image", "source": {"type": "url", "url": url}}
        )

    try:
        client = get_client()
        response = client.messages.create(
            model=settings.model_id,
            max_tokens=settings.max_tokens,
            system=_SYSTEM,
            messages=[{"role": "user", "content": content}],
            temperature=0.5,
        )
        import json

        text = response.content[0].text if response.content[0].type == "text" else "{}"
        data = json.loads(text)
        return AnalyzePhotosResponse(
            highlights=data.get("highlights", []),
            quality_score=data.get("quality_score", 50),
            suggestions=data.get("suggestions", []),
        )
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Failed to parse Claude response")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}") from e
