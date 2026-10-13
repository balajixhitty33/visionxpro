from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.schemas.detection import DetectionBox

class CaptureResultRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image string")
    confidence_threshold: Optional[float] = 0.25
    iou_threshold: Optional[float] = 0.45
    session_id: Optional[str] = None
    model: Optional[str] = "YOLO11n"

class DetectionObjectOut(BaseModel):
    id: str
    class_id: int
    class_name: str
    confidence: float
    x: float
    y: float
    width: float
    height: float
    norm_x: float
    norm_y: float
    norm_width: float
    norm_height: float
    track_id: Optional[int] = None

    class Config:
        from_attributes = True

class DetectionResultOut(BaseModel):
    id: str
    session_id: Optional[str] = None
    timestamp: datetime
    image_path: str
    thumbnail_path: Optional[str] = None
    width: int
    height: int
    object_count: int
    average_confidence: float
    processing_time_ms: float
    fps: float
    model_used: str
    detected_classes_summary: str
    objects: List[DetectionObjectOut] = []

    class Config:
        from_attributes = True

class DetectionResultSummary(BaseModel):
    id: str
    session_id: Optional[str] = None
    timestamp: datetime
    image_path: str
    thumbnail_path: Optional[str] = None
    object_count: int
    average_confidence: float
    model_used: str
    detected_classes_summary: str

    class Config:
        from_attributes = True
