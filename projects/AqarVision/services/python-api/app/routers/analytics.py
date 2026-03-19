"""POST /analytics/report + GET /analytics/export — Pandas aggregations + CSV/Excel export."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()


class ReportInput(BaseModel):
    agency_id: str
    period: str = "30d"  # 7d, 30d, 90d, 12m, custom
    date_from: str | None = None
    date_to: str | None = None
    format: str = "json"  # json or csv


@router.post("/report")
async def generate_report(data: ReportInput):
    # TODO: Implement Pandas aggregation from Supabase data
    raise NotImplementedError("Analytics report not yet implemented")


@router.get("/export/{export_type}")
async def export_data(export_type: str, agency_id: str):
    """Export listings, leads, analytics, or payments as CSV/XLSX."""
    # TODO: Implement Pandas to_csv/to_excel export
    raise NotImplementedError("Data export not yet implemented")
