import sys
import os
import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.cv.detector import yolo_engine

def test_classes_and_detection():
    print("Testing YOLO11n model loading...")
    yolo_engine.load_model("yolo11n.pt")
    
    print(f"Model loaded: {yolo_engine.is_loaded}")
    print(f"Model official class count: {len(yolo_engine.model.names)}")
    print(f"Sample classes (first 10): {[yolo_engine.model.names[i] for i in range(10)]}")
    
    # Create a realistic test image with multiple simulated recognizable objects
    # Or load a real test image with multiple objects
    img = np.zeros((720, 1280, 3), dtype=np.uint8)
    
    # Background gradient
    for y in range(720):
        img[y, :, :] = [int(40 + y*0.1), int(30 + y*0.1), int(20 + y*0.1)]
    
    # Draw a simulated laptop
    cv2.rectangle(img, (100, 200), (450, 450), (180, 180, 180), -1)
    cv2.rectangle(img, (120, 220), (430, 400), (30, 30, 30), -1)
    cv2.rectangle(img, (80, 440), (470, 480), (140, 140, 140), -1)
    
    # Draw a cup / bottle
    cv2.rectangle(img, (550, 250), (650, 500), (60, 120, 200), -1)
    cv2.ellipse(img, (600, 250), (50, 20), 0, 0, 360, (70, 140, 220), -1)
    cv2.ellipse(img, (600, 500), (50, 20), 0, 0, 360, (50, 100, 180), -1)
    
    # Draw a cell phone
    cv2.rectangle(img, (750, 300), (880, 550), (20, 20, 20), -1)
    cv2.rectangle(img, (760, 320), (870, 520), (200, 200, 250), -1)

    print("Running inference at conf=0.10, 0.25, 0.50...")
    for conf in [0.10, 0.25, 0.50]:
        res = yolo_engine.detect(img, conf_threshold=conf)
        print(f"Conf={conf}: detected {res['object_count']} objects: {[o['class_name'] + ' (' + str(round(o['confidence']*100, 1)) + '%)' for o in res['objects']]}")

if __name__ == "__main__":
    test_classes_and_detection()
