from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.database.session import get_db
from app.models.session import DetectionSession
from app.schemas.analytics import HistorySessionOut

router = APIRouter()

@router.get("/history", response_model=List[HistorySessionOut])
async def get_history(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Lists past detection sessions"""
    sessions = db.query(DetectionSession).order_by(desc(DetectionSession.started_at)).offset(offset).limit(limit).all()
    return sessions

@router.delete("/history/{session_id}")
async def delete_history_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Deletes detection session and associated data"""
    session = db.query(DetectionSession).filter(DetectionSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"success": True, "message": "Session deleted"}
