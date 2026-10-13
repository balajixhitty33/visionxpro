import time
import logging
import torch
import numpy as np
from typing import List, Dict, Any, Optional
from ultralytics import YOLO
import os
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger("visionx.detector")

class YOLOEngine:
    def __init__(self, model_name: str = "yolo11n.pt", device: str = "auto"):
        self.model_name = model_name
        self.device = self._resolve_device(device)
        self.model: Optional[YOLO] = None
        self.classes: Dict[int, str] = {}
        self.is_loaded = False
        self.is_loading = False

    def _resolve_device(self, device: str) -> str:
        if device == "auto" or not device:
            if torch.cuda.is_available():
                return "cuda"
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                return "mps"
            else:
                return "cpu"
        return device

    def _resolve_model_path(self, model_name: str) -> str:
        """Finds model weight file across project directories"""
        candidates = [
            Path(model_name),
            settings.BASE_PATH / model_name,
            settings.BASE_PATH / "backend" / model_name,
            settings.BASE_PATH.parent / "backend" / model_name,
            Path("/app/backend") / model_name,
            Path("/app") / model_name,
            Path.cwd() / model_name,
            Path.cwd() / "backend" / model_name,
        ]
        for candidate in candidates:
            if candidate.exists() and candidate.is_file():
                return str(candidate.resolve())
        return model_name

    def load_model(self, model_name: Optional[str] = None) -> bool:
        """Loads or reloads a YOLO model weight file and extracts official class names"""
        if model_name:
            self.model_name = model_name

        self.is_loading = True
        try:
            target_path = self._resolve_model_path(self.model_name)
            logger.info(f"Loading YOLO model: {self.model_name} (path: {target_path}) on device: {self.device}")
            try:
                self.model = YOLO(target_path)
            except Exception as e:
                logger.warning(f"Could not load {target_path} ({e}), falling back to yolov8n.pt")
                fallback_path = self._resolve_model_path("yolov8n.pt")
                self.model = YOLO(fallback_path)
                self.model_name = "yolov8n.pt"
                
            # Dynamically load official class names directly from the model
            raw_names = getattr(self.model, "names", {})
            if isinstance(raw_names, dict):
                self.classes = {int(k): str(v) for k, v in raw_names.items()}
            elif isinstance(raw_names, (list, tuple)):
                self.classes = {i: str(name) for i, name in enumerate(raw_names)}
            else:
                self.classes = {}

            self.is_loaded = True
            self.is_loading = False
            
            # Warm up model
            try:
                dummy_frame = np.zeros((320, 320, 3), dtype=np.uint8)
                self.model.predict(source=dummy_frame, verbose=False, device=self.device)
            except Exception as e:
                logger.warning(f"Warmup warning: {e}")

            logger.info(f"YOLO model {self.model_name} loaded successfully on {self.device} with {len(self.classes)} official classes")
            return True
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}", exc_info=True)
            self.is_loaded = False
            self.is_loading = False
            return False

    def get_class_name(self, cls_id: int) -> str:
        """Retrieves official class name for a given class ID"""
        if cls_id in self.classes:
            return self.classes[cls_id]
        if self.model and hasattr(self.model, "names"):
            names = self.model.names
            if isinstance(names, dict):
                return str(names.get(cls_id, names.get(str(cls_id), f"class_{cls_id}")))
            elif isinstance(names, (list, tuple)) and 0 <= cls_id < len(names):
                return str(names[cls_id])
        return f"class_{cls_id}"

    def detect(
        self,
        image: np.ndarray,
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45,
        max_det: int = 30
    ) -> Dict[str, Any]:
        """
        Runs object detection on a given OpenCV image.
        Returns all valid detections with bounding boxes, dynamic class names, confidence, and telemetry.
        """
        if not self.is_loaded or self.model is None:
            self.load_model(self.model_name)

        start_time = time.perf_counter()
        img_height, img_width = image.shape[:2]

        try:
            # Ensure confidence is clamped reasonably
            conf = max(0.01, min(0.99, float(conf_threshold)))
            iou = max(0.01, min(0.99, float(iou_threshold)))
            max_d = max(1, min(100, int(max_det)))

            results = self.model.predict(
                source=image,
                conf=conf,
                iou=iou,
                max_det=max_d,
                device=self.device,
                verbose=False
            )
            
            processing_time_ms = (time.perf_counter() - start_time) * 1000.0
            fps = 1000.0 / processing_time_ms if processing_time_ms > 0 else 30.0

            detections: List[Dict[str, Any]] = []
            class_counts: Dict[str, int] = {}
            confidences: List[float] = []

            if results and len(results) > 0:
                result = results[0]
                boxes = result.boxes

                if boxes is not None and len(boxes) > 0:
                    xyxy_arr = boxes.xyxy.cpu().numpy()
                    conf_arr = boxes.conf.cpu().numpy()
                    cls_arr = boxes.cls.cpu().numpy()
                    track_ids = boxes.id.cpu().numpy() if boxes.id is not None else None

                    # Extract names map from result or self
                    res_names = getattr(result, "names", None) or self.classes

                    for i in range(len(xyxy_arr)):
                        x1, y1, x2, y2 = float(xyxy_arr[i][0]), float(xyxy_arr[i][1]), float(xyxy_arr[i][2]), float(xyxy_arr[i][3])
                        conf_val = float(conf_arr[i])
                        cls_id = int(cls_arr[i])
                        
                        # Dynamically resolve official class name
                        if isinstance(res_names, dict):
                            cls_name = res_names.get(cls_id, res_names.get(str(cls_id)))
                        elif isinstance(res_names, (list, tuple)) and 0 <= cls_id < len(res_names):
                            cls_name = res_names[cls_id]
                        else:
                            cls_name = None

                        if not cls_name:
                            cls_name = self.get_class_name(cls_id)
                        cls_name = str(cls_name)

                        # Bounding box coordinates
                        x = max(0.0, x1)
                        y = max(0.0, y1)
                        width = max(0.0, x2 - x1)
                        height = max(0.0, y2 - y1)

                        # Normalized bounding box coordinates (0.0 to 1.0)
                        norm_x = x / img_width if img_width > 0 else 0.0
                        norm_y = y / img_height if img_height > 0 else 0.0
                        norm_width = width / img_width if img_width > 0 else 0.0
                        norm_height = height / img_height if img_height > 0 else 0.0

                        track_id = int(track_ids[i]) if track_ids is not None else None

                        confidences.append(conf_val)
                        class_counts[cls_name] = class_counts.get(cls_name, 0) + 1

                        detections.append({
                            "class_id": cls_id,
                            "class_name": cls_name,
                            "confidence": round(conf_val, 4),
                            "x": round(x, 1),
                            "y": round(y, 1),
                            "width": round(width, 1),
                            "height": round(height, 1),
                            "norm_x": round(norm_x, 4),
                            "norm_y": round(norm_y, 4),
                            "norm_width": round(norm_width, 4),
                            "norm_height": round(norm_height, 4),
                            "track_id": track_id
                        })

            avg_conf = (sum(confidences) / len(confidences)) if confidences else 0.0

            return {
                "success": True,
                "objects": detections,
                "object_count": len(detections),
                "average_confidence": round(avg_conf, 4),
                "processing_time_ms": round(processing_time_ms, 2),
                "fps": round(fps, 1),
                "image_width": img_width,
                "image_height": img_height,
                "class_counts": class_counts,
                "model": self.model_name,
                "device": self.device
            }

        except Exception as e:
            logger.error(f"Inference error: {e}", exc_info=True)
            processing_time_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "success": False,
                "error": str(e),
                "objects": [],
                "object_count": 0,
                "average_confidence": 0.0,
                "processing_time_ms": round(processing_time_ms, 2),
                "fps": 0.0,
                "image_width": img_width,
                "image_height": img_height,
                "class_counts": {},
                "model": self.model_name,
                "device": self.device
            }

# Singleton instance
yolo_engine = YOLOEngine()
