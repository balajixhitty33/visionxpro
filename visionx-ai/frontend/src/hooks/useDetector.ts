import { useState, useRef, useCallback, useEffect } from 'react';
import { DetectionBox, DetectionResponse } from '../types';
import { api } from '../services/api';
import { DetectionWebSocket } from '../services/websocket';

interface DetectorOptions {
  confidenceThreshold: number;
  iouThreshold: number;
  maxDetections: number;
  model: string;
  targetFPS?: number;
  useWebSocket?: boolean;
}

export function useDetector(
  captureFrame: () => string | null,
  options: DetectorOptions
) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [detections, setDetections] = useState<DetectionBox[]>([]);
  const [objectCount, setObjectCount] = useState<number>(0);
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [fps, setFps] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [avgConfidence, setAvgConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Keep fresh reference of options so slider changes are immediate
  const optionsRef = useRef<DetectorOptions>(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const loopRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const wsRef = useRef<DetectionWebSocket | null>(null);

  // Process a detection result
  const handleDetectionResult = useCallback((res: DetectionResponse) => {
    if (res.success) {
      setDetections(res.objects || []);
      setObjectCount(res.object_count || 0);
      setClassCounts(res.class_counts || {});
      setLatency(res.processing_time_ms || 0);
      setAvgConfidence(res.average_confidence || 0);
      setError(null);

      // Rolling FPS calculation
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      if (delta > 0) {
        const currentFps = 1000 / delta;
        fpsHistoryRef.current.push(currentFps);
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }
        const smoothFps =
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
        setFps(Math.round(smoothFps));
      }
    } else if (res.error) {
      setError(res.error);
    }
  }, []);

  // Frame processing step
  const processFrame = useCallback(async () => {
    if (!isDetecting || isPaused || isProcessingRef.current) {
      return;
    }

    const frameBase64 = captureFrame();
    if (!frameBase64) {
      return;
    }

    isProcessingRef.current = true;
    const currentOpts = optionsRef.current;
    try {
      if (currentOpts.useWebSocket && wsRef.current?.isConnected()) {
        wsRef.current.sendFrame(
          frameBase64,
          currentOpts.confidenceThreshold,
          currentOpts.iouThreshold,
          currentOpts.maxDetections
        );
      } else {
        const res = await api.detectFrame(
          frameBase64,
          currentOpts.confidenceThreshold,
          currentOpts.iouThreshold,
          currentOpts.maxDetections,
          currentOpts.model
        );
        handleDetectionResult(res);
      }
    } catch (err: any) {
      console.warn('Detection frame error:', err);
      setError(err.message || 'Detection failed');
    } finally {
      isProcessingRef.current = false;
    }
  }, [isDetecting, isPaused, captureFrame, handleDetectionResult]);

  // Main inference loop
  useEffect(() => {
    if (!isDetecting || isPaused) {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(65, Math.floor(1000 / (options.targetFPS || 10)));
    loopRef.current = window.setInterval(processFrame, intervalMs);

    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [isDetecting, isPaused, processFrame, options.targetFPS]);

  // Start Detection
  const startDetection = useCallback(async () => {
    setError(null);
    setIsPaused(false);
    setIsDetecting(true);
    lastFrameTimeRef.current = performance.now();

    if (optionsRef.current.useWebSocket) {
      try {
        const ws = new DetectionWebSocket();
        await ws.connect(handleDetectionResult, (err) => {
          console.warn('WebSocket connection error, falling back to HTTP REST', err);
        });
        wsRef.current = ws;
      } catch {
        console.info('Using HTTP REST detection mode');
      }
    }
  }, [handleDetectionResult]);

  // Pause / Resume Detection
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Stop Detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    setIsPaused(false);
    setDetections([]);
    setObjectCount(0);
    setClassCounts({});
    setFps(0);
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  return {
    isDetecting,
    isPaused,
    detections,
    objectCount,
    classCounts,
    fps,
    latency,
    avgConfidence,
    error,
    startDetection,
    togglePause,
    stopDetection,
    setDetections,
  };
}
