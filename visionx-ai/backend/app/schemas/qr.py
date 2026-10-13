from pydantic import BaseModel, Field
from typing import List, Optional, Any

class QRItem(BaseModel):
    text: str
    type: str
    points: Optional[List[List[float]]] = None
    x: float
    y: float
    width: float
    height: float
    norm_x: float
    norm_y: float
    norm_width: float
    norm_height: float

class QRScanRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded image or frame")

class QRScanResponse(BaseModel):
    success: bool
    qr_count: int
    results: List[QRItem]
    image_width: int
    image_height: int
    error: Optional[str] = None

class QRGenerateRequest(BaseModel):
    data: str = Field(..., min_length=1)
    fill_color: Optional[str] = "#2F80FF"
    back_color: Optional[str] = "#0D1728"
    size: Optional[int] = 10
    border: Optional[int] = 2
    error_correction: Optional[str] = "M"

class QRGenerateResponse(BaseModel):
    success: bool
    data_url: str
    data: str
    type: str
    size: int
    error: Optional[str] = None
