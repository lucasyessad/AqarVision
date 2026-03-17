"""Search intent NLP endpoint."""

from fastapi import APIRouter, Depends

from schemas.requests import SearchIntentRequest, SearchIntentResponse
from services.claude_client import complete
from services.errors import extract_json, safe_api_error
from routers._auth import verify_service_key

router = APIRouter(tags=["search"], dependencies=[Depends(verify_service_key)])

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
        text = await complete(
            system=_SYSTEM,
            user_message=f"Langue: {req.locale}\nRecherche: {req.query}",
            temperature=0.2,
        )
        data = extract_json(text)
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
            confidence=max(0.0, min(1.0, data.get("confidence", 0.5))),
        )
    except Exception as e:
        raise safe_api_error(e) from e
