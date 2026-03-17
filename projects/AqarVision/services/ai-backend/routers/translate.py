"""Translation endpoints — single and batch."""

from fastapi import APIRouter, Depends

from schemas.requests import (
    TranslateBatchRequest,
    TranslateBatchResponse,
    TranslateRequest,
    TranslateResponse,
)
from services.claude_client import complete
from services.errors import extract_json, safe_api_error
from routers._auth import verify_service_key

router = APIRouter(tags=["translate"], dependencies=[Depends(verify_service_key)])

_LOCALE_NAMES = {"fr": "français", "ar": "arabe", "en": "anglais", "es": "espagnol"}


def _build_system(source: str, target: str) -> str:
    return (
        f"Tu es un traducteur professionnel spécialisé dans l'immobilier algérien. "
        f"Traduis le texte suivant du {source} vers le {target}. "
        f"Conserve le ton professionnel et les termes immobiliers locaux. "
        f"Retourne uniquement la traduction, sans commentaire."
    )


@router.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest) -> TranslateResponse:
    source = _LOCALE_NAMES.get(req.source_locale, req.source_locale)
    target = _LOCALE_NAMES.get(req.target_locale, req.target_locale)
    try:
        translated = await complete(
            system=_build_system(source, target),
            user_message=req.text,
            temperature=0.3,
        )
        return TranslateResponse(
            translated_text=translated, target_locale=req.target_locale
        )
    except Exception as e:
        raise safe_api_error(e) from e


@router.post("/translate/batch", response_model=TranslateBatchResponse)
async def translate_batch(req: TranslateBatchRequest) -> TranslateBatchResponse:
    """Translate multiple fields in a single Claude call (e.g. title + description)."""
    source = _LOCALE_NAMES.get(req.source_locale, req.source_locale)
    target = _LOCALE_NAMES.get(req.target_locale, req.target_locale)

    system = (
        f"Tu es un traducteur professionnel spécialisé dans l'immobilier algérien. "
        f"Traduis chaque champ du {source} vers le {target}. "
        f"Conserve le ton professionnel et les termes immobiliers locaux. "
        f"Réponds UNIQUEMENT en JSON strict avec les mêmes clés que l'entrée."
    )

    # Build user message with labeled fields
    parts = [f'"{key}": "{value}"' for key, value in req.texts.items()]
    user_message = "Traduis ce JSON :\n{" + ", ".join(parts) + "}"

    try:
        text = await complete(system=system, user_message=user_message, temperature=0.3)
        data = extract_json(text)

        # Ensure all requested keys are in the response
        translations = {key: data.get(key, value) for key, value in req.texts.items()}

        return TranslateBatchResponse(
            translations=translations, target_locale=req.target_locale
        )
    except Exception as e:
        raise safe_api_error(e) from e
