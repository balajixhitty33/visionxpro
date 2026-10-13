import sys
import os
import cv2
import numpy as np
import time

# Ensure backend root is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.cv.detector import yolo_engine
from app.cv.frame_utils import encode_image_to_base64
from app.database.init_db import init_database
from app.database.session import SessionLocal
from app.services.detection_service import DetectionService

def test_full_pipeline():
    print("1. Initializing Database...")
    init_database()
    print("Database initialized successfully.")

    print("2. Checking YOLO Engine...")
    print(f"Model: {yolo_engine.model_name}, Device: {yolo_engine.device}, Loaded: {yolo_engine.is_loaded}")
    
    print("3. Creating synthetic test image...")
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Draw simple shapes
    cv2.circle(img, (200, 200), 80, (255, 255, 255), -1)
    cv2.rectangle(img, (350, 150), (550, 350), (200, 200, 200), -1)

    print("4. Testing direct inference...")
    res = yolo_engine.detect(img, conf_threshold=0.25)
    print(f"Inference result: success={res['success']}, latency={res['processing_time_ms']}ms, fps={res['fps']}, objects={len(res['objects'])}")

    print("5. Testing capture service with base64...")
    b64 = encode_image_to_base64(img)
    db = SessionLocal()
    try:
        captured = DetectionService.process_and_save_capture(
            db=db,
            image_base64=b64,
            conf_threshold=0.25
        )
        print(f"Saved capture record ID: {captured.id}, image_path: {captured.image_path}")
        
        overview = DetectionService.get_analytics_overview(db)
        print(f"Analytics overview total sessions: {overview['total_sessions']}, total captures: {overview['total_captures']}")
    finally:
        db.close()

    print("ALL BACKEND TESTS PASSED.")

if __name__ == "__main__":
    test_full_pipeline()
