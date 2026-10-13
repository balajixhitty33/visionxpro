import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

import cv2
import numpy as np
from app.cv.detector import yolo_engine
from app.cv.frame_utils import encode_image_to_base64, decode_base64_image
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=" * 60)
    print("STEP 1: VERIFYING YOLO MODEL LOADING")
    print("=" * 60)
    
    model_loaded = yolo_engine.load_model("yolo11n.pt")
    print(f"YOLO MODEL NAME: {yolo_engine.model_name}")
    print(f"MODEL DEVICE: {yolo_engine.device}")
    print(f"MODEL LOADED: {yolo_engine.is_loaded}")
    print(f"NUMBER OF CLASSES: {len(yolo_engine.classes)}")
    
    assert yolo_engine.is_loaded, "Failed to load YOLO model!"
    
    print("\n" + "=" * 60)
    print("STEP 2: DIRECT OPENCV + YOLO TEST (zidane.jpg)")
    print("=" * 60)
    
    image_path = backend_dir / "data" / "zidane.jpg"
    assert image_path.exists(), f"Test image not found at {image_path}"
    
    img = cv2.imread(str(image_path))
    print(f"IMAGE BYTES: {img.nbytes} bytes")
    print(f"IMAGE SHAPE: {img.shape}")
    print(f"IMAGE DTYPE: {img.dtype}")
    
    res = yolo_engine.detect(img, conf_threshold=0.25, iou_threshold=0.45)
    print(f"\nDETECTIONS COUNT: {res['object_count']}")
    print(f"INFERENCE TIME: {res['processing_time_ms']} ms")
    print(f"AVERAGE CONFIDENCE: {res['average_confidence'] * 100:.1f}%")
    print(f"CLASSES FOUND: {res['class_counts']}")
    
    for i, obj in enumerate(res["objects"]):
        print(f" [{i+1}] Class ID: {obj['class_id']} | Class: {obj['class_name']} | Conf: {obj['confidence']*100:.1f}% | Box: [x={obj['x']}, y={obj['y']}, w={obj['width']}, h={obj['height']}]")
        
    assert res["object_count"] > 0, "Expected at least 1 detection on zidane.jpg!"
    
    print("\n" + "=" * 60)
    print("STEP 3: MULTI-OBJECT DETECTION TEST (bus_sample.jpg)")
    print("=" * 60)
    
    bus_path = backend_dir / "data" / "bus_sample.jpg"
    if bus_path.exists():
        bus_img = cv2.imread(str(bus_path))
        bus_res = yolo_engine.detect(bus_img, conf_threshold=0.25, iou_threshold=0.45)
        print(f"DETECTIONS COUNT: {bus_res['object_count']}")
        print(f"CLASSES DETECTED: {bus_res['class_counts']}")
        for i, obj in enumerate(bus_res["objects"]):
            print(f" [{i+1}] {obj['class_name']} ({obj['confidence']*100:.1f}%) -> Box: [x={obj['x']}, y={obj['y']}, w={obj['width']}, h={obj['height']}]")
        assert bus_res["object_count"] >= 2, "Expected multiple objects on bus_sample.jpg!"
        
    print("\n" + "=" * 60)
    print("STEP 4: FASTAPI POST /api/detect END-TO-END TEST")
    print("=" * 60)
    
    client = TestClient(app)
    
    # Test with base64 encoded image
    b64_image = encode_image_to_base64(img)
    payload = {
        "image": b64_image,
        "confidence_threshold": 0.25,
        "iou_threshold": 0.45,
        "max_detections": 30,
        "model": "yolo11n.pt"
    }
    
    response = client.post("/api/detect", json=payload)
    print(f"HTTP STATUS: {response.status_code}")
    data = response.json()
    print(f"API SUCCESS: {data.get('success')}")
    print(f"OBJECTS RETURNED: {data.get('object_count')}")
    print(f"SAMPLE OBJECT: {data.get('objects', [{}])[0] if data.get('objects') else 'None'}")
    
    assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
    assert data["success"] is True, "API returned success: false"
    assert data["object_count"] > 0, "API returned 0 objects"
    
    print("\n" + "=" * 60)
    print("ALL BACKEND DETECTION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
