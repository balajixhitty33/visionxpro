import sys
import os
import cv2
import numpy as np
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.cv.detector import yolo_engine

def run_tests():
    yolo_engine.load_model("yolo11n.pt")
    
    # Test images
    images_to_test = [
        ("bus.jpg", "https://ultralytics.com/images/bus.jpg"),
        ("zidane.jpg", "https://ultralytics.com/images/zidane.jpg")
    ]
    
    for filename, url in images_to_test:
        img_path = os.path.join(os.path.dirname(__file__), "data", filename)
        if not os.path.exists(img_path):
            print(f"Downloading {filename}...")
            urllib.request.urlretrieve(url, img_path)
            
        image = cv2.imread(img_path)
        print(f"\n==========================================")
        print(f"Testing {filename} (shape: {image.shape})")
        print(f"==========================================")
        
        result = yolo_engine.detect(image, conf_threshold=0.25, iou_threshold=0.45)
        print(f"Detected {result['object_count']} objects at conf=0.25:")
        for idx, obj in enumerate(result['objects']):
            print(f" {idx+1}. {obj['class_name'].upper()} (ClassID: {obj['class_id']}) - {obj['confidence']*100:.1f}% | Box: [x={obj['x']}, y={obj['y']}, w={obj['width']}, h={obj['height']}]")

if __name__ == "__main__":
    run_tests()
