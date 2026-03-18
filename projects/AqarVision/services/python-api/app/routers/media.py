"""POST /media/analyze — Image quality analysis using OpenCV + Pillow."""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

router = APIRouter()


class ImageAnalysisResult(BaseModel):
    quality_score: int  # 0-100
    issues: list[str]
    resolution: dict  # { width, height }
    is_blurry: bool
    brightness: float
    has_watermark: bool


@router.post("/analyze", response_model=ImageAnalysisResult)
async def analyze_image(file: UploadFile = File(...)):
    # TODO: Implement OpenCV/Pillow analysis
    raise NotImplementedError("Image analyzer not yet implemented")
