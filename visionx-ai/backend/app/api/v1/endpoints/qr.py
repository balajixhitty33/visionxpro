from fastapi import APIRouter, HTTPException, UploadFile, File
import cv2
import numpy as np

from app.cv.qr_detector import vision_qr_service
from app.schemas.qr import QRScanRequest, QRScanResponse, QRGenerateRequest, QRGenerateResponse

router = APIRouter()

@router.post("/qr/scan", response_model=QRScanResponse)
async def scan_qr_code(req: QRScanRequest):
    """
    Scans an image or video frame for QR codes using OpenCV computer vision.
    Returns decoded payload, type (URL, text, WiFi, vCard), and precise bounding polygon.
    """
    try:
        res = vision_qr_service.scan_image(req.image)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"QR scan failed: {str(e)}")

@router.post("/qr/upload", response_model=QRScanResponse)
async def scan_qr_upload(file: UploadFile = File(...)):
    """Scans an uploaded image file for QR codes"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        res = vision_qr_service.scan_image(img)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/qr/generate", response_model=QRGenerateResponse)
async def generate_qr_code(req: QRGenerateRequest):
    """Generates custom high-resolution QR code with color styling"""
    try:
        res = vision_qr_service.generate_qr(
            data=req.data,
            fill_color=req.fill_color or "#2F80FF",
            back_color=req.back_color or "#0D1728",
            size=req.size or 10,
            border=req.border or 2,
            error_correction=req.error_correction or "M"
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"QR generation failed: {str(e)}")
