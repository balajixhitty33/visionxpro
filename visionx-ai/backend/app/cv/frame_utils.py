import base64
import io
import os
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional, Dict, Any, List
from app.core.config import settings

def decode_base64_image(base64_str: str) -> np.ndarray:
    """Decodes a base64 or data URL string to an OpenCV BGR numpy array"""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    
    image_bytes = base64.b64decode(base64_str)
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Could not decode image from base64 data")
    return image

def encode_image_to_base64(image: np.ndarray, format: str = ".jpg", quality: int = 85) -> str:
    """Encodes an OpenCV image to a base64 data URL"""
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality] if format == ".jpg" else []
    success, buffer = cv2.imencode(format, image, encode_params)
    if not success:
        raise ValueError("Could not encode image")
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"

def save_frame_to_disk(image: np.ndarray, file_id: str) -> Tuple[str, str]:
    """
    Saves the full resolution image and a compact thumbnail to disk.
    Returns relative paths (image_path, thumbnail_path).
    """
    filename = f"{file_id}.jpg"
    thumb_filename = f"{file_id}_thumb.jpg"
    
    full_path = settings.CAPTURES_PATH / filename
    thumb_path = settings.CAPTURES_PATH / thumb_filename
    
    # Save full resolution JPEG
    cv2.imwrite(str(full_path), image, [cv2.IMWRITE_JPEG_QUALITY, 90])
    
    # Create thumbnail (320px width proportional)
    h, w = image.shape[:2]
    thumb_w = 320
    thumb_h = int((h / w) * thumb_w)
    thumbnail = cv2.resize(image, (thumb_w, thumb_h), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(thumb_path), thumbnail, [cv2.IMWRITE_JPEG_QUALITY, 80])
    
    return f"/captures/{filename}", f"/captures/{thumb_filename}"

def draw_detections_on_image(
    image: np.ndarray,
    detections: List[Dict[str, Any]],
    box_color: Tuple[int, int, int] = (255, 128, 47),  # BGR for blue
    text_color: Tuple[int, int, int] = (255, 255, 255)
) -> np.ndarray:
    """Draws bounding boxes and labels directly onto an OpenCV image"""
    annotated = image.copy()
    
    for det in detections:
        x, y, w, h = int(det["x"]), int(det["y"]), int(det["width"]), int(det["height"])
        label = f"{det['class_name']} {int(det['confidence'] * 100)}%"
        
        # Draw box
        cv2.rectangle(annotated, (x, y), (x + w, y + h), box_color, 2)
        
        # Draw label background
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.55
        thickness = 1
        (label_w, label_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)
        
        cv2.rectangle(
            annotated,
            (x, max(0, y - label_h - 10)),
            (x + label_w + 10, y),
            box_color,
            -1
        )
        
        # Draw label text
        cv2.putText(
            annotated,
            label,
            (x + 5, max(label_h + 2, y - 5)),
            font,
            font_scale,
            text_color,
            thickness,
            cv2.LINE_AA
        )
        
    return annotated
