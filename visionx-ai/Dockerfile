# Multi-stage Dockerfile for VisionX AI (Full-Stack)
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend & Unified Server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for OpenCV and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend Application
COPY backend/ ./backend/

# Copy Compiled Frontend Dist from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose Port
ENV PORT=8000
EXPOSE 8000

# Start Unified FastAPI Production Server
WORKDIR /app/backend
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
