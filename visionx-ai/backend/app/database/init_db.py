import uuid
from datetime import datetime, timedelta
from app.database.session import engine, Base, SessionLocal
from app.models.session import DetectionSession
from app.models.result import DetectionResult
from app.models.object import DetectionObject
from app.models.settings import UserSettings

def init_database():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if settings exist, otherwise create default
        settings = db.query(UserSettings).filter(UserSettings.id == "default").first()
        if not settings:
            default_settings = UserSettings(
                id="default",
                camera_id="default",
                resolution_width=1280,
                resolution_height=720,
                target_fps=30,
                model_name="YOLO11n",
                confidence_threshold=0.25,
                iou_threshold=0.45,
                max_detections=30,
                device="auto",
                detection_overlay=True,
                show_labels=True,
                show_confidence=True,
                sound_notifications=False,
                theme="dark"
            )
            db.add(default_settings)

        # Seed initial session history if empty
        if db.query(DetectionSession).count() == 0:
            now = datetime.now()
            sample_sessions = [
                DetectionSession(
                    id=str(uuid.uuid4()),
                    session_number=1,
                    started_at=now - timedelta(hours=2, minutes=15),
                    ended_at=now - timedelta(hours=2, minutes=10),
                    duration_seconds=300,
                    total_frames=9000,
                    avg_fps=29.8,
                    avg_latency=33.5,
                    avg_confidence=0.954,
                    detected_classes="Person, Laptop, Phone, Cup",
                    status="Completed",
                    model_used="YOLO11n"
                ),
                DetectionSession(
                    id=str(uuid.uuid4()),
                    session_number=2,
                    started_at=now - timedelta(hours=1, minutes=20),
                    ended_at=now - timedelta(hours=1, minutes=14),
                    duration_seconds=360,
                    total_frames=10800,
                    avg_fps=30.0,
                    avg_latency=32.8,
                    avg_confidence=0.962,
                    detected_classes="Person, Car, Traffic Light, Backpack",
                    status="Completed",
                    model_used="YOLO11n"
                ),
                DetectionSession(
                    id=str(uuid.uuid4()),
                    session_number=3,
                    started_at=now - timedelta(minutes=45),
                    ended_at=now - timedelta(minutes=30),
                    duration_seconds=900,
                    total_frames=27000,
                    avg_fps=29.4,
                    avg_latency=34.0,
                    avg_confidence=0.948,
                    detected_classes="Person, Chair, Bottle, Keyboard, Mouse",
                    status="Completed",
                    model_used="YOLO11n"
                ),
                DetectionSession(
                    id=str(uuid.uuid4()),
                    session_number=4,
                    started_at=now - timedelta(minutes=15),
                    ended_at=now - timedelta(minutes=5),
                    duration_seconds=600,
                    total_frames=18000,
                    avg_fps=29.9,
                    avg_latency=33.4,
                    avg_confidence=0.958,
                    detected_classes="Person, Dog, Bicycle",
                    status="Completed",
                    model_used="YOLO11n"
                ),
            ]
            for s in sample_sessions:
                db.add(s)

        db.commit()
    except Exception as e:
        print(f"Error initializing DB: {e}")
        db.rollback()
    finally:
        db.close()
