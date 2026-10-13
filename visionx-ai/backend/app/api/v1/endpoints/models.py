from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import torch
import psutil

from app.cv.detector import yolo_engine
from app.core.config import settings

router = APIRouter()

AVAILABLE_MODELS = [
    {
        "id": "yolo11n.pt",
        "name": "YOLO11n (Nano)",
        "version": "11.0",
        "size_mb": 5.6,
        "parameters": "2.6M",
        "speed": "Fastest (Ultra-low latency)",
        "mAP": "39.5%",
        "description": "Next-gen lightweight model optimized for edge devices and real-time webcam streams.",
        "recommended": True
    },
    {
        "id": "yolov8n.pt",
        "name": "YOLOv8n (Nano)",
        "version": "8.0",
        "size_mb": 6.2,
        "parameters": "3.2M",
        "speed": "Ultra Fast",
        "mAP": "37.3%",
        "description": "Standard reliable lightweight model with high precision and low CPU footprint.",
        "recommended": False
    },
    {
        "id": "yolov8s.pt",
        "name": "YOLOv8s (Small)",
        "version": "8.0",
        "size_mb": 22.5,
        "parameters": "11.2M",
        "speed": "Fast",
        "mAP": "44.9%",
        "description": "Higher precision model with extra capacity for complex multi-object occlusion.",
        "recommended": False
    }
]

class ModelSwitchRequest(BaseModel):
    model_name: str
    device: str = "auto"

@router.get("/health")
async def health_check():
    """System health check and hardware telemetry"""
    mem = psutil.virtual_memory()
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model_loaded": yolo_engine.is_loaded,
        "current_model": yolo_engine.model_name,
        "device": yolo_engine.device,
        "cuda_available": torch.cuda.is_available(),
        "classes_count": len(yolo_engine.classes),
        "cpu_usage_pct": psutil.cpu_percent(),
        "memory_used_pct": mem.percent,
        "memory_available_gb": round(mem.available / (1024**3), 2)
    }

@router.get("/models")
async def get_models():
    """Returns list of supported YOLO models, active engine, and official class names"""
    return {
        "current_model": yolo_engine.model_name,
        "current_device": yolo_engine.device,
        "is_loaded": yolo_engine.is_loaded,
        "classes": yolo_engine.classes,
        "class_count": len(yolo_engine.classes),
        "available_models": AVAILABLE_MODELS
    }

@router.post("/models/load")
async def switch_model(req: ModelSwitchRequest):
    """Dynamically switch YOLO weights or hardware acceleration target"""
    success = yolo_engine.load_model(req.model_name)
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to load model {req.model_name}")
    return {
        "success": True,
        "message": f"Successfully loaded {req.model_name}",
        "current_model": yolo_engine.model_name,
        "device": yolo_engine.device,
        "class_count": len(yolo_engine.classes)
    }
