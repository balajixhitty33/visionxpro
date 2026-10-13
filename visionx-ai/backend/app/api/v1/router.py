from fastapi import APIRouter
from app.api.v1.endpoints import detect, models, results, analytics, history, settings, qr

api_router = APIRouter()

api_router.include_router(detect.router, tags=["Detection"])
api_router.include_router(qr.router, tags=["Vision QR"])
api_router.include_router(models.router, tags=["Models & Health"])
api_router.include_router(results.router, tags=["Results & Captures"])
api_router.include_router(analytics.router, tags=["Analytics"])
api_router.include_router(history.router, tags=["History"])
api_router.include_router(settings.router, tags=["Settings"])
