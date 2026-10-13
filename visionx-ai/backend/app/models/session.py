from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database.session import Base

class DetectionSession(Base):
    __tablename__ = "detection_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_number = Column(Integer, autoincrement=True, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0)
    total_frames = Column(Integer, default=0)
    avg_fps = Column(Float, default=0.0)
    avg_latency = Column(Float, default=0.0)
    avg_confidence = Column(Float, default=0.0)
    detected_classes = Column(String, default="")  # Comma-separated list
    status = Column(String, default="Completed")  # Active, Completed, Paused
    model_used = Column(String, default="YOLO11n")

    results = relationship("DetectionResult", back_populates="session", cascade="all, delete-orphan")
