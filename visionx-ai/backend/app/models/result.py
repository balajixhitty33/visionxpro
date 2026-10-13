from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database.session import Base

class DetectionResult(Base):
    __tablename__ = "detection_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("detection_sessions.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    image_path = Column(String, nullable=False)
    thumbnail_path = Column(String, nullable=True)
    width = Column(Integer, default=1280)
    height = Column(Integer, default=720)
    object_count = Column(Integer, default=0)
    average_confidence = Column(Float, default=0.0)
    processing_time_ms = Column(Float, default=0.0)
    fps = Column(Float, default=0.0)
    model_used = Column(String, default="YOLO11n")
    detected_classes_summary = Column(String, default="")  # e.g. "Person (2), Laptop (1)"

    session = relationship("DetectionSession", back_populates="results")
    objects = relationship("DetectionObject", back_populates="result", cascade="all, delete-orphan")
