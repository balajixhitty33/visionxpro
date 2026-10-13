from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.analytics import AnalyticsOverview
from app.services.detection_service import DetectionService

router = APIRouter()

@router.get("/analytics", response_model=AnalyticsOverview)
async def get_analytics(db: Session = Depends(get_db)):
    """Provides high-level performance analytics, object distribution, and accuracy telemetry"""
    analytics = DetectionService.get_analytics_overview(db=db)
    return analytics
