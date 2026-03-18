"""POST /pdf/generate — PDF generation using WeasyPrint."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()


class PdfInput(BaseModel):
    template: str  # invoice, listing_report, analytics_report
    data: dict
    locale: str = "fr"


@router.post("/generate")
async def generate_pdf(data: PdfInput):
    # TODO: Implement WeasyPrint HTML→PDF rendering
    raise NotImplementedError("PDF generator not yet implemented")
