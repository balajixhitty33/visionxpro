import io
import cv2
import numpy as np
import base64
import qrcode
from qrcode.constants import ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q, ERROR_CORRECT_H
from typing import List, Dict, Any, Optional
from app.cv.frame_utils import decode_base64_image

class VisionQRService:
    def __init__(self):
        self.detector = cv2.QRCodeDetector()

    def scan_image(self, image_input: Any) -> Dict[str, Any]:
        """
        Scans an OpenCV BGR image or base64 string for QR codes.
        Applies multi-pass image enhancement (Grayscale, CLAHE, Inverted, Otsu)
        to detect high-contrast, dark mode, colored, and low-light QR codes.
        """
        if isinstance(image_input, str):
            image = decode_base64_image(image_input)
        elif isinstance(image_input, np.ndarray):
            image = image_input
        else:
            raise ValueError("Unsupported image type")

        h, w = image.shape[:2]
        results: List[Dict[str, Any]] = []

        try:
            # Multi-pass candidate images for robust detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
            inverted = cv2.bitwise_not(gray)
            _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            _, otsu_inv = cv2.threshold(inverted, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            candidates = [image, gray, clahe, inverted, otsu, otsu_inv]

            for cand in candidates:
                # 1. Multi QR detection
                try:
                    decoded_info, points, _ = self.detector.detectAndDecodeMulti(cand)
                    if points is not None and len(points) > 0 and any(decoded_info):
                        for idx, pts in enumerate(points):
                            text = decoded_info[idx] if idx < len(decoded_info) else ""
                            if not text:
                                continue
                            
                            pts_list = pts.tolist() if isinstance(pts, np.ndarray) else pts
                            xs = [p[0] for p in pts_list]
                            ys = [p[1] for p in pts_list]
                            min_x, max_x = max(0, min(xs)), min(w, max(xs))
                            min_y, max_y = max(0, min(ys)), min(h, max(ys))
                            box_w = max_x - min_x
                            box_h = max_y - min_y

                            results.append({
                                "text": text,
                                "type": self._detect_payload_type(text),
                                "points": pts_list,
                                "x": round(min_x, 1),
                                "y": round(min_y, 1),
                                "width": round(box_w, 1),
                                "height": round(box_h, 1),
                                "norm_x": round(min_x / w, 4) if w > 0 else 0,
                                "norm_y": round(min_y / h, 4) if h > 0 else 0,
                                "norm_width": round(box_w / w, 4) if w > 0 else 0,
                                "norm_height": round(box_h / h, 4) if h > 0 else 0,
                            })
                        if results:
                            break
                except Exception:
                    pass

                # 2. Single QR fallback
                if not results:
                    try:
                        text, pts, _ = self.detector.detectAndDecode(cand)
                        if text and pts is not None and len(pts) > 0:
                            pts_list = pts[0].tolist() if len(pts.shape) == 3 else pts.tolist()
                            xs = [p[0] for p in pts_list]
                            ys = [p[1] for p in pts_list]
                            min_x, max_x = max(0, min(xs)), min(w, max(xs))
                            min_y, max_y = max(0, min(ys)), min(h, max(ys))
                            box_w = max_x - min_x
                            box_h = max_y - min_y

                            results.append({
                                "text": text,
                                "type": self._detect_payload_type(text),
                                "points": pts_list,
                                "x": round(min_x, 1),
                                "y": round(min_y, 1),
                                "width": round(box_w, 1),
                                "height": round(box_h, 1),
                                "norm_x": round(min_x / w, 4) if w > 0 else 0,
                                "norm_y": round(min_y / h, 4) if h > 0 else 0,
                                "norm_width": round(box_w / w, 4) if w > 0 else 0,
                                "norm_height": round(box_h / h, 4) if h > 0 else 0,
                            })
                            break
                    except Exception:
                        pass

            # Deduplicate by text
            unique_results = []
            seen_texts = set()
            for r in results:
                if r["text"] and r["text"] not in seen_texts:
                    seen_texts.add(r["text"])
                    unique_results.append(r)

            return {
                "success": True,
                "qr_count": len(unique_results),
                "results": unique_results,
                "image_width": w,
                "image_height": h,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "qr_count": 0,
                "results": [],
                "image_width": w,
                "image_height": h,
            }

    def generate_qr(
        self,
        data: str,
        fill_color: str = "#2F80FF",
        back_color: str = "#0D1728",
        size: int = 10,
        border: int = 2,
        error_correction: str = "M"
    ) -> Dict[str, Any]:
        """
        Generates a custom stylized QR code as base64 PNG data URL.
        """
        ec_map = {
            "L": ERROR_CORRECT_L,
            "M": ERROR_CORRECT_M,
            "Q": ERROR_CORRECT_Q,
            "H": ERROR_CORRECT_H
        }
        ec_level = ec_map.get(error_correction.upper(), ERROR_CORRECT_M)

        qr = qrcode.QRCode(
            version=None,
            error_correction=ec_level,
            box_size=size,
            border=border,
        )
        qr.add_data(data)
        qr.make(fit=True)

        img = qr.make_image(fill_color=fill_color, back_color=back_color)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_bytes = buffered.getvalue()
        b64_str = base64.b64encode(img_bytes).decode("utf-8")

        return {
            "success": True,
            "data_url": f"data:image/png;base64,{b64_str}",
            "data": data,
            "type": self._detect_payload_type(data),
            "size": len(img_bytes)
        }

    def _detect_payload_type(self, text: str) -> str:
        if not text:
            return "empty"
        t = text.strip().lower()
        if t.startswith("http://") or t.startswith("https://") or t.startswith("www."):
            return "url"
        elif t.startswith("wifi:"):
            return "wifi"
        elif t.startswith("begin:vcard"):
            return "vcard"
        elif t.startswith("mailto:") or "@" in t:
            return "email"
        elif t.startswith("tel:"):
            return "phone"
        elif t.startswith("sms:") or t.startswith("smsto:"):
            return "sms"
        return "text"

# Singleton instance
vision_qr_service = VisionQRService()
