from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class DetectionBox(BaseModel):
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

class DetectionRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image string or data URL")
    confidence_threshold: Optional[float] = Field(0.25, ge=0.01, le=1.0)
    iou_threshold: Optional[float] = Field(0.45, ge=0.01, le=1.0)
    max_detections: Optional[int] = Field(30, ge=1, le=100)
    model: Optional[str] = None

class DetectionResponse(BaseModel):
    success: bool
    objects: List[DetectionBox]
    object_count: int
    average_confidence: float
    processing_time_ms: float
    fps: float
    image_width: int
    image_height: int
    class_counts: Dict[str, int]
    model: str
    device: str
    error: Optional[str] = None
