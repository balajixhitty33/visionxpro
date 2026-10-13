# VisionX AI — Real-time AI-Powered Object Detection & Computer Vision Platform

> **See. Detect. Understand.**  
> Real-time AI-powered object detection and computer vision workstation platform built with FastAPI, Ultralytics YOLO11n, OpenCV, React, TypeScript, and Tailwind CSS.

---

## 🌟 Overview

**VisionX AI** is a dark navy, high-performance Computer Vision SaaS workstation designed for real-time edge object detection, live telemetry tracking, and dataset capture. The application features a high-conversion SaaS Landing Page and an interactive Object Detection Studio supporting real webcam input (`navigator.mediaDevices.getUserMedia`), real-time dynamic bounding boxes rendered over high-DPI HTML5 canvas, instant snapshot capture, session history, and full Recharts analytics.

---

## ✨ Features

- **⚡ Real-Time YOLO Inference**: Powered by Ultralytics **YOLO11n** (with fallback to YOLOv8n / YOLOv8s) for sub-15ms edge inference.
- **🎥 Real Webcam Video Processing**: Native browser WebRTC integration with support for 720p, 1080p, and 480p streams.
- **🎯 Dynamic Canvas Bounding Boxes**: Synchronized bounding box overlays with class names, confidence percentages, glowing borders, and corner brackets.
- **📊 Workstation Telemetry**: Real-time FPS calculation, latency measurement, object counters, and class frequency distribution.
- **📸 Snapshot Capture & Storage**: Instant snapshot capture saving both annotated full-resolution frames and thumbnails to disk and database.
- **📈 Advanced Analytics Dashboard**: Interactive Recharts visualizations for COCO class distribution, accuracy trends, FPS stability, and latency.
- **🎛️ Model Configuration & Hyperparameters**: Dynamic sliders for Confidence Threshold (0.10–0.95), IoU NMS Threshold, and Max Detections.
- **📜 Session History Logs**: Complete session audit trail with duration, frame count, detected classes, and CSV/JSON export.
- **⚙️ Workstation Settings**: Customizable display overlays, labels, confidence scores, audio alerts, and theme preferences.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom Computer Vision SaaS theme
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Data Visualization**: Recharts

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **Computer Vision**: Ultralytics YOLO (`YOLO11n`, `YOLOv8n`), OpenCV (`opencv-python-headless`)
- **Deep Learning**: PyTorch, Torchvision
- **Database**: SQLAlchemy ORM (SQLite with PostgreSQL migration readiness)
- **Validation**: Pydantic v2 & Pydantic-Settings

---

## 📂 Project Structure

```
visionx-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, ToastContainer
│   │   │   └── detector/         # CameraWorkspace, CameraControlBar, LiveAnalyticsPanel
│   │   ├── hooks/
│   │   │   ├── useCamera.ts      # WebRTC stream manager
│   │   │   ├── useDetector.ts    # Throttled YOLO inference loop & FPS counter
│   │   │   └── useToast.ts       # Non-blocking notification system
│   │   ├── layouts/
│   │   │   └── StudioLayout.tsx  # Workstation shell with top header & left sidebar
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Screen 1: High-converting SaaS Landing Page
│   │   │   ├── DetectorPage.tsx  # Screen 2: Object Detection Studio Workstation
│   │   │   ├── ModelConfigPage.tsx # YOLO model configuration & device settings
│   │   │   ├── ResultsPage.tsx   # Captured snapshot gallery
│   │   │   ├── ResultDetailPage.tsx # Deep inspection with bounding box layers
│   │   │   ├── HistoryPage.tsx   # Session logs & CSV export
│   │   │   ├── AnalyticsPage.tsx # Recharts telemetry dashboard
│   │   │   └── SettingsPage.tsx  # Application & camera preferences
│   │   ├── services/
│   │   │   ├── api.ts            # REST API client
│   │   │   └── websocket.ts      # WebSocket streaming client
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── colors.ts         # Object class color palette mapping
│   │   │   └── formatters.ts     # Telemetry & timestamp formatting
│   │   ├── App.tsx               # App routing
│   │   ├── index.css             # Tailwind base & custom styles
│   │   └── main.tsx              # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── detect.py     # REST & WebSocket detection endpoints
│   │   │       │   ├── models.py     # Model information & switching
│   │   │       │   ├── results.py    # Snapshot management & image serving
│   │   │       │   ├── analytics.py  # Telemetry aggregations
│   │   │       │   ├── history.py    # Session history
│   │   │       │   └── settings.py   # User settings
│   │   │       └── router.py         # Main API router
│   │   ├── core/
│   │   │   └── config.py             # App configuration & CORS
│   │   ├── cv/
│   │   │   ├── detector.py           # YOLO inference engine
│   │   │   └── frame_utils.py        # Frame base64 decoder & disk saver
│   │   ├── database/
│   │   │   ├── session.py            # SQLAlchemy database engine
│   │   │   └── init_db.py            # Table initialization & initial seeds
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── session.py
│   │   │   ├── result.py
│   │   │   ├── object.py
│   │   │   └── settings.py
│   │   ├── schemas/                  # Pydantic validation schemas
│   │   │   ├── detection.py
│   │   │   ├── result.py
│   │   │   └── analytics.py
│   │   ├── services/
│   │   │   └── detection_service.py  # Business logic & DB transactions
│   │   └── main.py                   # FastAPI app entry point
│   ├── data/
│   │   ├── captures/                 # Stored snapshot image files
│   │   └── visionx.db                # SQLite database
│   ├── requirements.txt
│   ├── test_detection.py
│   └── .env.example
│
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (v20+ or v24 LTS recommended)
- **Python**: v3.10+ (Python 3.10, 3.11, 3.12, 3.13, 3.14 supported)
- **Webcam**: Built-in or USB camera for live detection

---

### 2. Backend Setup & Run

```bash
# Navigate to backend directory
cd visionx-ai/backend

# Install dependencies
python -m pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at:
- **API Base**: `http://localhost:8000/api`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

---

### 3. Frontend Setup & Run

```bash
# In a separate terminal, navigate to frontend directory
cd visionx-ai/frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

Frontend will open at:
- **Web Application**: `http://localhost:5173`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check, CPU/Memory telemetry & GPU acceleration info |
| `GET` | `/api/models` | List available YOLO models and current active engine |
| `POST` | `/api/models/load` | Dynamically switch YOLO model weights |
| `POST` | `/api/detect` | Frame inference with confidence/IoU thresholding |
| `POST` | `/api/detect/frame` | High-throughput multipart & base64 frame detector |
| `WS` | `/ws/detection` | Full-duplex WebSocket stream for ultra-low latency inference |
| `POST` | `/api/results` | Capture & persist annotated frame snapshot to disk & database |
| `GET` | `/api/results` | List captured snapshots with pagination |
| `GET` | `/api/results/{id}` | Get full detection snapshot metadata & bounding boxes |
| `DELETE` | `/api/results/{id}` | Delete detection snapshot and associated image files |
| `GET` | `/api/analytics` | Aggregated class distribution, accuracy, and FPS metrics |
| `GET` | `/api/history` | List detection session history records |
| `DELETE` | `/api/history/{id}` | Delete session history entry |
| `GET` | `/api/settings` | Retrieve user workstation configuration |
| `POST` | `/api/settings` | Update user workstation preferences |

---

## 🔒 Security & Privacy

- Frames are processed in real time and are **not saved permanently** unless the user explicitly clicks the **Capture** button.
- Clean CORS configuration preventing unauthorized cross-origin requests.
- Strict input validation via Pydantic v2 schemas.

---

## 📄 License

MIT License © 2026 VisionX AI.
