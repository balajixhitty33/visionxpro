from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
CAPTURES_DIR = DATA_DIR / "captures"

# Ensure data directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
CAPTURES_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionX AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True
    
    # Computer Vision Settings
    DEFAULT_MODEL: str = "yolo11n.pt"
    CONFIDENCE_THRESHOLD: float = 0.25
    IOU_THRESHOLD: float = 0.45
    MAX_DETECTIONS: int = 30
    DEFAULT_DEVICE: str = "auto"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{DATA_DIR / 'visionx.db'}"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Storage Paths
    BASE_PATH: Path = BASE_DIR
    DATA_PATH: Path = DATA_DIR
    CAPTURES_PATH: Path = CAPTURES_DIR

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
