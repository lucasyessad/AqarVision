"""POST /nlp/search-semantic — Arabic NLP using CAMeL Tools."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SemanticSearchInput(BaseModel):
    query: str
    locale: str = "ar"
    limit: int = 20


class SemanticSearchResult(BaseModel):
    tokens: list[str]
    normalized: list[str]
    detected_intent: dict  # { property_type, wilaya_hint, commune_hint, size_hint }
    search_query_fr: str


@router.post("/search-semantic", response_model=SemanticSearchResult)
async def search_semantic(data: SemanticSearchInput):
    # TODO: Implement CAMeL Tools tokenization + intent extraction
    raise NotImplementedError("Arabic NLP not yet implemented")
