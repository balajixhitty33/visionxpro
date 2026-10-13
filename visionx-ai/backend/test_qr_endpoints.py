import sys
import os
import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.cv.qr_detector import vision_qr_service

def test_qr_service():
    print("Testing QR Generation...")
    gen_res = vision_qr_service.generate_qr(
        data="https://visionx.ai/detector",
        fill_color="#2F80FF",
        back_color="#0D1728"
    )
    assert gen_res["success"] is True
    print(f"QR generated successfully! Data URL length: {len(gen_res['data_url'])}, Type: {gen_res['type']}")

    print("\nTesting QR Decoding on generated QR code...")
    scan_res = vision_qr_service.scan_image(gen_res["data_url"])
    print(f"Scan success: {scan_res['success']}")
    print(f"QR count detected: {scan_res['qr_count']}")
    if scan_res["results"]:
        decoded_text = scan_res["results"][0]["text"]
        print(f"Decoded text: {decoded_text}")
        assert decoded_text == "https://visionx.ai/detector"
        print("QR round-trip test passed perfectly!")

if __name__ == "__main__":
    test_qr_service()
