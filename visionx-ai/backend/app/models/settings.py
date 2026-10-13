from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.session import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String, primary_key=True, default="default")
    camera_id = Column(String, default="default")
    resolution_width = Column(Integer, default=1280)
    resolution_height = Column(Integer, default=720)
    target_fps = Column(Integer, default=30)
    model_name = Column(String, default="YOLO11n")
    confidence_threshold = Column(Float, default=0.25)
    iou_threshold = Column(Float, default=0.45)
    max_detections = Column(Integer, default=30)
    device = Column(String, default="auto")
    detection_overlay = Column(Boolean, default=True)
    show_labels = Column(Boolean, default=True)
    show_confidence = Column(Boolean, default=True)
    sound_notifications = Column(Boolean, default=False)
    theme = Column(String, default="dark")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
