"""Search intent NLP endpoint."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services.claude_client import complete
from routers._auth import verify_service_key

router = APIRouter(tags=["search"], dependencies=[Depends(verify_service_key)])


class SearchIntentRequest(BaseModel):
    query: str
    locale: str = "fr"


class SearchIntentResponse(BaseModel):
    property_type: str | None = None
    listing_type: str | None = None
    wilaya: str | None = None
    commune: str | None = None
    min_price: int | None = None
    max_price: int | None = None
    min_surface: int | None = None
    max_surface: int | None = None
    rooms: int | None = None
    keywords: list[str] = []
    confidence: float = 0.0


_SYSTEM = (
    "Tu es un assistant spécialisé dans la recherche immobilière en Algérie. "
    "L'utilisateur exprime une intention de recherche en langage naturel. "
    "Extrais les critères structurés de recherche. "
    "Les types de bien possibles sont : apartment, villa, studio, land, commercial, office, garage. "
    "Les types d'annonce : sale, rent. "
    "Les wilayas sont les 58 wilayas algériennes (ex: Alger, Oran, Constantine, Tizi Ouzou). "
    "Réponds UNIQUEMENT en JSON strict avec les champs : "
    "property_type, listing_type, wilaya, commune, min_price, max_price, "
    "min_surface, max_surface, rooms, keywords (array de mots-clés pertinents), confidence (0-1). "
    "Si un champ ne peut pas être déduit, mets null."
)


@router.post("/search/intent", response_model=SearchIntentResponse)
async def parse_search_intent(req: SearchIntentRequest) -> SearchIntentResponse:
    try:
        import json

        text = await complete(
            system=_SYSTEM,
            user_message=f"Langue: {req.locale}\nRecherche: {req.query}",
            temperature=0.2,
        )
        data = json.loads(text)
        return SearchIntentResponse(
            property_type=data.get("property_type"),
            listing_type=data.get("listing_type"),
            wilaya=data.get("wilaya"),
            commune=data.get("commune"),
            min_price=data.get("min_price"),
            max_price=data.get("max_price"),
            min_surface=data.get("min_surface"),
            max_surface=data.get("max_surface"),
            rooms=data.get("rooms"),
            keywords=data.get("keywords", []),
            confidence=data.get("confidence", 0.5),
        )
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Failed to parse Claude response")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}") from e
