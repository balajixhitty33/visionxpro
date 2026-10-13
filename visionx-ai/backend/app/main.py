import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import os

from app.core.config import settings
from app.database.init_db import init_database
from app.api.v1.router import api_router
from app.cv.detector import yolo_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("visionx.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables & default seed data
    logger.info("Initializing VisionX AI database and models...")
    init_database()
    try:
        yolo_engine.load_model("yolo11n.pt")
        logger.info("YOLO11n model pre-warmed and ready for live detection.")
    except Exception as e:
        logger.warning(f"Could not pre-warm YOLO model: {e}")
    logger.info("VisionX AI backend started successfully.")
    yield
    # Shutdown
    logger.info("Shutting down VisionX AI backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="VisionX AI — Real-time AI-powered object detection and computer vision platform.",
    lifespan=lifespan
)

# Standard permissive CORS configuration compatible with Vercel and browser preflight OPTIONS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount captures static folder
if not settings.CAPTURES_PATH.exists():
    settings.CAPTURES_PATH.mkdir(parents=True, exist_ok=True)

app.mount("/captures", StaticFiles(directory=str(settings.CAPTURES_PATH)), name="captures")

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Determine Frontend Dist path for production unified serving
possible_frontend_paths = [
    settings.BASE_PATH.parent / "frontend" / "dist",
    settings.BASE_PATH / "static",
    settings.BASE_PATH / "dist",
    Path("/app/frontend/dist"),
    Path("./frontend/dist")
]

frontend_dist: Path = None
for p in possible_frontend_paths:
    if p.exists() and (p / "index.html").exists():
        frontend_dist = p
        break

if frontend_dist:
    logger.info(f"Production mode: Mounting compiled frontend SPA from {frontend_dist}")
    
    # Mount static assets subfolder
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # SPA Fallback for client routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API, docs, openapi, captures to bypass
        if full_path.startswith("api") or full_path.startswith("captures") or full_path in ["docs", "openapi.json", "redoc"]:
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        index_path = frontend_dist / "index.html"
        return FileResponse(index_path)
else:
    @app.get("/")
    async def root():
        return {
            "app": settings.PROJECT_NAME,
            "tagline": "See. Detect. Understand.",
            "version": settings.VERSION,
            "docs_url": "/docs",
            "api_health": f"{settings.API_V1_STR}/health"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
