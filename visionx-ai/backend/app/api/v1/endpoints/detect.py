import time
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, UploadFile, File, Form
from typing import Optional

from app.cv.detector import yolo_engine
from app.cv.frame_utils import decode_base64_image
from app.schemas.detection import DetectionRequest, DetectionResponse
import cv2
import numpy as np

logger = logging.getLogger("visionx.api.detect")
router = APIRouter()

@router.post("/detect", response_model=DetectionResponse)
async def detect_objects(req: DetectionRequest):
    """
    Main detection endpoint. Accepts base64 encoded image frame and returns
    all detected objects with bounding boxes, official class names, confidence, and latency metrics.
    """
    try:
        # Decode base64 image to OpenCV BGR
        image = decode_base64_image(req.image)
        
        # If a specific model was requested and is different from current
        if req.model and req.model != yolo_engine.model_name:
            yolo_engine.load_model(req.model)

        conf = req.confidence_threshold if req.confidence_threshold is not None else 0.25
        iou = req.iou_threshold if req.iou_threshold is not None else 0.45
        max_d = req.max_detections if req.max_detections is not None else 30

        result = yolo_engine.detect(
            image=image,
            conf_threshold=conf,
            iou_threshold=iou,
            max_det=max_d
        )
        return result
    except Exception as e:
        logger.error(f"Detection failed: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

@router.post("/detect/frame", response_model=DetectionResponse)
async def detect_frame(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    conf_threshold: float = Form(0.25),
    iou_threshold: float = Form(0.45),
    max_detections: int = Form(30)
):
    """
    High-throughput frame detection supporting both binary file uploads and base64.
    """
    try:
        if file:
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif image_base64:
            image = decode_base64_image(image_base64)
        else:
            raise HTTPException(status_code=400, detail="No image provided")

        result = yolo_engine.detect(
            image=image,
            conf_threshold=conf_threshold,
            iou_threshold=iou_threshold,
            max_det=max_detections
        )
        return result
    except Exception as e:
        logger.error(f"Frame detection error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.websocket("/ws/detection")
async def websocket_detection_endpoint(websocket: WebSocket):
    """
    Real-time full-duplex WebSocket stream for ultra low latency live webcam detection.
    """
    await websocket.accept()
    logger.info("WebSocket detection client connected")
    
    try:
        while True:
            data_text = await websocket.receive_text()
            data = json.loads(data_text)
            
            image_b64 = data.get("image")
            conf_thresh = data.get("conf_threshold", 0.25)
            iou_thresh = data.get("iou_threshold", 0.45)
            max_det = data.get("max_detections", 30)

            if not image_b64:
                await websocket.send_json({"success": False, "error": "No image payload", "objects": []})
                continue

            try:
                image = decode_base64_image(image_b64)
                result = yolo_engine.detect(
                    image=image,
                    conf_threshold=conf_thresh,
                    iou_threshold=iou_thresh,
                    max_det=max_det
                )
                await websocket.send_json(result)
            except Exception as e:
                await websocket.send_json({"success": False, "error": str(e), "objects": []})
                
    except WebSocketDisconnect:
        logger.info("WebSocket detection client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
