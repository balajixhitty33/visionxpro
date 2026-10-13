from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path

from app.database.session import get_db
from app.schemas.result import CaptureResultRequest, DetectionResultOut, DetectionResultSummary
from app.services.detection_service import DetectionService
from app.core.config import settings

router = APIRouter()

@router.post("/results", response_model=DetectionResultOut)
async def capture_and_save_result(
    req: CaptureResultRequest,
    db: Session = Depends(get_db)
):
    """
    Captures snapshot, executes YOLO inference, saves image file and DB record,
    and returns full detection metadata.
    """
    try:
        result = DetectionService.process_and_save_capture(
            db=db,
            image_base64=req.image,
            conf_threshold=req.confidence_threshold or 0.50,
            iou_threshold=req.iou_threshold or 0.45,
            session_id=req.session_id,
            model_name=req.model
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to capture and store result: {str(e)}")

@router.get("/results", response_model=List[DetectionResultOut])
async def list_results(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Lists saved detection snapshots with bounding box records"""
    results = DetectionService.get_results(db=db, limit=limit, offset=offset)
    return results

@router.get("/results/{result_id}", response_model=DetectionResultOut)
async def get_result_detail(
    result_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves specific detection snapshot by ID"""
    result = DetectionService.get_result_by_id(db=db, result_id=result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

@router.delete("/results/{result_id}")
async def delete_result(
    result_id: str,
    db: Session = Depends(get_db)
):
    """Deletes detection snapshot and its associated image files"""
    result = DetectionService.get_result_by_id(db=db, result_id=result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Try deleting files from disk
    try:
        if result.image_path:
            img_name = os.path.basename(result.image_path)
            full_path = settings.CAPTURES_PATH / img_name
            if full_path.exists():
                full_path.unlink()
        if result.thumbnail_path:
            thumb_name = os.path.basename(result.thumbnail_path)
            thumb_path = settings.CAPTURES_PATH / thumb_name
            if thumb_path.exists():
                thumb_path.unlink()
    except Exception:
        pass

    success = DetectionService.delete_result(db=db, result_id=result_id)
    return {"success": success, "message": "Result deleted successfully"}
