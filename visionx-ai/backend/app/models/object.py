from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.database.session import Base

class DetectionObject(Base):
    __tablename__ = "detection_objects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    result_id = Column(String, ForeignKey("detection_results.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, default=0)
    class_name = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    # Bounding box coordinates (absolute pixels)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    # Normalized coordinates (0.0 to 1.0)
    norm_x = Column(Float, default=0.0)
    norm_y = Column(Float, default=0.0)
    norm_width = Column(Float, default=0.0)
    norm_height = Column(Float, default=0.0)
    track_id = Column(Integer, nullable=True)

    result = relationship("DetectionResult", back_populates="objects")
