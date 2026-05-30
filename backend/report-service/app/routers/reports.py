from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.report_service import ReportService
from app.consumers.report_consumer import start_report_consumer
import os

router = APIRouter()

class ReportRequest(BaseModel):
    format: str = "PDF"
    case_counts: Optional[dict] = {}
    period: Optional[str] = None

@router.post("/generate")
async def generate_report(request: ReportRequest):
    try:
        if request.format.upper() == "PDF":
            path = await ReportService.generate_pdf(request.dict())
        else:
            path = await ReportService.generate_csv(request.dict())
        return {
            "status": "generated",
            "format": request.format,
            "file": os.path.basename(path),
            "path": path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
