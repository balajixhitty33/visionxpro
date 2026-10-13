from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.models.settings import UserSettings

router = APIRouter()

class UserSettingsSchema(BaseModel):
    camera_id: Optional[str] = "default"
    resolution_width: Optional[int] = 1280
    resolution_height: Optional[int] = 720
    target_fps: Optional[int] = 30
    model_name: Optional[str] = "YOLO11n"
    confidence_threshold: Optional[float] = 0.50
    iou_threshold: Optional[float] = 0.45
    max_detections: Optional[int] = 30
    device: Optional[str] = "auto"
    detection_overlay: Optional[bool] = True
    show_labels: Optional[bool] = True
    show_confidence: Optional[bool] = True
    sound_notifications: Optional[bool] = False
    theme: Optional[str] = "dark"

    class Config:
        from_attributes = True

@router.get("/settings", response_model=UserSettingsSchema)
async def get_settings(db: Session = Depends(get_db)):
    """Fetches current user settings"""
    settings = db.query(UserSettings).filter(UserSettings.id == "default").first()
    if not settings:
        settings = UserSettings(id="default")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.post("/settings", response_model=UserSettingsSchema)
async def update_settings(payload: UserSettingsSchema, db: Session = Depends(get_db)):
    """Updates user preferences"""
    settings = db.query(UserSettings).filter(UserSettings.id == "default").first()
    if not settings:
        settings = UserSettings(id="default")
        db.add(settings)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings
