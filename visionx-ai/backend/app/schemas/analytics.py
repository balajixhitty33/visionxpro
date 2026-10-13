from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class ClassDistributionItem(BaseModel):
    name: str
    count: int
    percentage: float
    color: str

class AccuracyTrendItem(BaseModel):
    time: str
    accuracy: float
    fps: float

class PerformanceMetricItem(BaseModel):
    name: str
    value: float
    unit: str
    change: str
    status: str

class AnalyticsOverview(BaseModel):
    total_sessions: int
    total_objects_detected: int
    average_confidence: float
    average_fps: float
    average_latency_ms: float
    total_captures: int
    class_distribution: List[ClassDistributionItem]
    accuracy_trend: List[AccuracyTrendItem]
    fps_trend: List[Dict[str, Any]]
    recent_sessions: List[Dict[str, Any]]

class HistorySessionOut(BaseModel):
    id: str
    session_number: Optional[int] = 1
    started_at: datetime
    duration_seconds: int
    total_frames: int
    avg_fps: float
    avg_latency: float
    avg_confidence: float
    detected_classes: str
    status: str
    model_used: str

    class Config:
        from_attributes = True
