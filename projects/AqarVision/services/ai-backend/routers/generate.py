"""Listing description generation endpoint."""

from fastapi import APIRouter, Depends

from schemas.requests import GenerateDescriptionRequest, GenerateDescriptionResponse
from services.claude_client import complete
from services.errors import safe_api_error
from routers._auth import verify_service_key

router = APIRouter(tags=["generate"], dependencies=[Depends(verify_service_key)])

_LOCALE_NAMES = {"fr": "français", "ar": "arabe", "en": "anglais", "es": "espagnol"}


def _build_system_prompt(locale: str) -> str:
    lang = _LOCALE_NAMES.get(locale, "français")
    return (
        f"Tu es un rédacteur immobilier expert en Algérie. "
        f"Rédige une description d'annonce immobilière en {lang}. "
        f"Sois professionnel, engageant et concis (150-250 mots). "
        f"Mets en avant les points forts du bien. "
        f"N'invente pas de détails non fournis."
    )


def _build_user_message(req: GenerateDescriptionRequest) -> str:
    parts = [
        f"Titre : {req.title}",
        f"Type de bien : {req.property_type}",
        f"Type d'annonce : {req.listing_type}",
        f"Wilaya : {req.wilaya}",
        f"Prix : {req.price} {req.currency}",
    ]
    if req.commune:
        parts.append(f"Commune : {req.commune}")
    if req.surface_m2:
        parts.append(f"Surface : {req.surface_m2} m²")
    if req.rooms:
        parts.append(f"Pièces : {req.rooms}")
    if req.bathrooms:
        parts.append(f"Salles de bain : {req.bathrooms}")
    if req.details:
        extras = ", ".join(f"{k}: {v}" for k, v in req.details.items())
        parts.append(f"Détails : {extras}")
    return "\n".join(parts)


@router.post("/generate/description", response_model=GenerateDescriptionResponse)
async def generate_description(
    req: GenerateDescriptionRequest,
) -> GenerateDescriptionResponse:
    try:
        description = await complete(
            system=_build_system_prompt(req.locale),
            user_message=_build_user_message(req),
            temperature=0.7,
        )
        return GenerateDescriptionResponse(description=description, locale=req.locale)
    except Exception as e:
        raise safe_api_error(e) from e
