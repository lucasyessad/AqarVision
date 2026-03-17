"""Translation endpoint."""

from fastapi import APIRouter, Depends, HTTPException

from schemas.requests import TranslateRequest, TranslateResponse
from services.claude_client import complete
from routers._auth import verify_service_key

router = APIRouter(tags=["translate"], dependencies=[Depends(verify_service_key)])

_LOCALE_NAMES = {
    "fr": "français",
    "ar": "arabe",
    "en": "anglais",
    "es": "espagnol",
}


@router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest) -> TranslateResponse:
    source = _LOCALE_NAMES.get(req.source_locale, req.source_locale)
    target = _LOCALE_NAMES.get(req.target_locale, req.target_locale)
    system = (
        f"Tu es un traducteur professionnel spécialisé dans l'immobilier algérien. "
        f"Traduis le texte suivant du {source} vers le {target}. "
        f"Conserve le ton professionnel et les termes immobiliers locaux. "
        f"Retourne uniquement la traduction, sans commentaire."
    )
    try:
        translated = await complete(
            system=system,
            user_message=req.text,
            temperature=0.3,
        )
        return TranslateResponse(
            translated_text=translated, target_locale=req.target_locale
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}") from e
