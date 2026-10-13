import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StudioLayout } from '../layouts/StudioLayout';
import { CameraWorkspace } from '../components/detector/CameraWorkspace';
import { CameraControlBar } from '../components/detector/CameraControlBar';
import { LiveAnalyticsPanel } from '../components/detector/LiveAnalyticsPanel';
import { useCamera } from '../hooks/useCamera';
import { useDetector } from '../hooks/useDetector';
import { api } from '../services/api';
import { toast } from '../hooks/useToast';
import { DetectionBox, DetectionResponse } from '../types';
import { getObjectColor, hexToRgba } from '../utils/colors';
import {
  Video,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  Maximize2,
} from 'lucide-react';

export const DetectorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.25);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  const [maxDetections, setMaxDetections] = useState<number>(30);
  const [modelName, setModelName] = useState<string>('YOLO11n');
  const [device, setDevice] = useState<string>('auto');
  const [resolution, setResolution] = useState<{ width: number; height: number }>({
    width: 1280,
    height: 720,
  });
  const [isCapturing, setIsCapturing] = useState(false);

  // Upload Image Detection State
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [uploadDetections, setUploadDetections] = useState<DetectionBox[]>([]);
  const [uploadStats, setUploadStats] = useState<{
    inferenceTimeMs: number;
    objectCount: number;
    classes: string[];
    fps: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const uploadImgElementRef = useRef<HTMLImageElement | null>(null);

  // Initialize camera hook
  const {
    videoRef,
    status,
    errorMessage,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    startCamera,
    stopCamera,
    captureFrame,
  } = useCamera();

  // Initialize detector hook for live camera
  const {
    isDetecting,
    isPaused,
    detections,
    objectCount,
    classCounts,
    fps,
    latency,
    avgConfidence,
    error: detectorError,
    startDetection,
    togglePause,
    stopDetection,
  } = useDetector(captureFrame, {
    confidenceThreshold,
    iouThreshold,
    maxDetections,
    model: modelName,
    targetFPS: 12,
  });

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings();
        if (settings) {
          setConfidenceThreshold(settings.confidence_threshold || 0.25);
          setIouThreshold(settings.iou_threshold || 0.45);
          setMaxDetections(settings.max_detections || 30);
          setModelName(settings.model_name || 'YOLO11n');
          setDevice(settings.device || 'auto');
        }
      } catch (err) {
        console.warn('Could not load user settings, using defaults', err);
      }
    };
    loadSettings();
  }, []);

  // Ensure detection loop is active whenever camera is running
  useEffect(() => {
    if (status === 'active' && !isDetecting && !isPaused) {
      startDetection();
    }
  }, [status, isDetecting, isPaused, startDetection]);

  // Handle start camera & detection
  const handleStartCamera = useCallback(async () => {
    try {
      await startCamera({
        width: resolution.width,
        height: resolution.height,
      });
      startDetection();
      toast('info', 'Camera Active', 'Real-time YOLO inference started.');
    } catch (err: any) {
      toast('error', 'Camera Error', err.message || 'Could not start camera.');
    }
  }, [startCamera, startDetection, resolution]);

  // Handle stop camera
  const handleStopCamera = useCallback(() => {
    stopDetection();
    stopCamera();
    toast('info', 'Camera Stopped', 'Live detection paused.');
  }, [stopDetection, stopCamera]);

  // Handle resolution change
  const handleResolutionChange = useCallback(
    async (width: number, height: number) => {
      setResolution({ width, height });
      if (status === 'active' || status === 'detecting') {
        await startCamera({ width, height });
      }
    },
    [status, startCamera]
  );

  // Handle Snapshot Capture
  const handleCapture = useCallback(async () => {
    const frameBase64 = captureFrame(0.92);
    if (!frameBase64) {
      toast('warning', 'Capture Failed', 'Camera frame not ready.');
      return;
    }

    setIsCapturing(true);
    try {
      const result = await api.captureSnapshot(
        frameBase64,
        confidenceThreshold,
        iouThreshold,
        undefined,
        modelName
      );
      toast(
        'success',
        'Detection captured successfully',
        `Stored ${result.object_count} objects (${result.detected_classes_summary || 'None'})`
      );
    } catch (err: any) {
      toast('error', 'Capture Failed', err.message || 'Could not save capture.');
    } finally {
      setIsCapturing(false);
    }
  }, [captureFrame, confidenceThreshold, iouThreshold, modelName]);

  // Render bounding boxes on uploaded image canvas
  const drawUploadCanvas = useCallback((boxes: DetectionBox[]) => {
    const canvas = uploadCanvasRef.current;
    const img = uploadImgElementRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = img.naturalWidth || img.width || 800;
    const height = img.naturalHeight || img.height || 600;

    canvas.width = width;
    canvas.height = height;

    // Draw background image
    ctx.drawImage(img, 0, 0, width, height);

    // Draw detections
    boxes.forEach((box) => {
      const x = box.norm_x !== undefined && box.norm_x !== null ? box.norm_x * width : box.x;
      const y = box.norm_y !== undefined && box.norm_y !== null ? box.norm_y * height : box.y;
      const w = box.norm_width !== undefined && box.norm_width !== null ? box.norm_width * width : box.width;
      const h = box.norm_height !== undefined && box.norm_height !== null ? box.norm_height * height : box.height;

      const color = getObjectColor(box.class_name);
      const confPct = box.confidence <= 1.0 ? Math.round(box.confidence * 100) : Math.round(box.confidence);
      const label = `${box.class_name.toUpperCase()} ${confPct}%`;

      // 1. Draw glowing outer bounding box
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, Math.round(width / 400));
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;

      // 2. Draw subtle fill
      ctx.fillStyle = hexToRgba(color, 0.12);
      ctx.fillRect(x, y, w, h);

      // 3. Corner brackets
      const cornerSize = Math.min(20, w * 0.2, h * 0.2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(2.5, Math.round(width / 350));

      ctx.beginPath();
      ctx.moveTo(x, y + cornerSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerSize, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + w - cornerSize, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerSize);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerSize, y + h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + w - cornerSize, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerSize);
      ctx.stroke();

      // 4. Label Badge
      const fontSize = Math.max(13, Math.round(width / 60));
      ctx.font = `bold ${fontSize}px "JetBrains Mono", Inter, sans-serif`;
      const textMetrics = ctx.measureText(label);
      const badgeHeight = fontSize + 10;
      const badgeWidth = textMetrics.width + 16;
      const badgeY = Math.max(0, y - badgeHeight);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, badgeY, badgeWidth, badgeHeight, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, x + 8, badgeY + fontSize);
    });
  }, []);

  // Run AI Detection on an Image Data URL
  const runDetectionOnImage = useCallback(
    async (imageSrc: string) => {
      setIsProcessingUpload(true);
      try {
        const result: DetectionResponse = await api.detectFrame(
          imageSrc,
          confidenceThreshold,
          iouThreshold,
          maxDetections,
          modelName
        );

        const detectionsList = result.objects || [];
        setUploadDetections(detectionsList);
        const uniqueClasses: string[] = Array.from(new Set(detectionsList.map((d: DetectionBox) => d.class_name)));
        const latencyMs = result.processing_time_ms || 18;
        setUploadStats({
          inferenceTimeMs: latencyMs,
          objectCount: result.object_count || detectionsList.length,
          classes: uniqueClasses,
          fps: result.fps || (latencyMs ? Math.round(1000 / latencyMs) : 30),
        });

        // Update canvas
        setTimeout(() => {
          drawUploadCanvas(detectionsList);
        }, 100);

        toast(
          'success',
          'Detection Complete',
          `Found ${result.object_count} object${result.object_count === 1 ? '' : 's'} (${uniqueClasses.join(', ') || 'None'}) in ${latencyMs}ms`
        );
      } catch (err: any) {
        console.error('Image detection failed:', err);
        toast('error', 'Detection Failed', err.message || 'Could not process image on AI server.');
      } finally {
        setIsProcessingUpload(false);
      }
    },
    [confidenceThreshold, iouThreshold, maxDetections, modelName, drawUploadCanvas]
  );

  // Handle File Input Change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('error', 'Invalid File', 'Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImageSrc(src);
      setUploadDetections([]);
      setUploadStats(null);

      // Create an image to get dimensions and run detection
      const img = new Image();
      img.onload = () => {
        uploadImgElementRef.current = img;
        runDetectionOnImage(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Re-run detection on current uploaded image when sliders change
  const handleReanalyzeUpload = () => {
    if (uploadedImageSrc) {
      runDetectionOnImage(uploadedImageSrc);
    }
  };

  return (
    <StudioLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Mode Selector Tabs */}
        <div className="bg-background-panel border-b border-border px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'camera'
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'text-content-secondary hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Live Camera Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'text-content-secondary hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Upload className="w-4 h-4 text-brand-cyan" />
              <span>Upload Image Detection</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-content-secondary">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Powered by Ultralytics {modelName}</span>
          </div>
        </div>

        {/* WORKSPACE CONTENT */}
        {activeTab === 'camera' ? (
          <div className="flex-1 flex flex-col xl:flex-row min-w-0">
            {/* Main Workstation Workspace (Left / Center) */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-border">
              <CameraWorkspace
                videoRef={videoRef}
                status={status}
                errorMessage={errorMessage || detectorError}
                detections={detections}
                isDetecting={isDetecting}
                isPaused={isPaused}
                onStartCamera={handleStartCamera}
                onRetry={handleStartCamera}
                resolution={resolution}
                onResolutionChange={handleResolutionChange}
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                onDeviceChange={setSelectedDeviceId}
                isCapturing={isCapturing}
              />

              <CameraControlBar
                status={status}
                isDetecting={isDetecting}
                isPaused={isPaused}
                isCapturing={isCapturing}
                onStartCamera={handleStartCamera}
                onStopCamera={handleStopCamera}
                onTogglePause={togglePause}
                onCapture={handleCapture}
              />
            </div>

            {/* Right Analytics & Parameter Sliders Panel */}
            <LiveAnalyticsPanel
              objectCount={objectCount}
              fps={fps}
              latency={latency}
              avgConfidence={avgConfidence}
              detections={detections}
              confidenceThreshold={confidenceThreshold}
              onConfidenceChange={setConfidenceThreshold}
              iouThreshold={iouThreshold}
              onIouChange={setIouThreshold}
              maxDetections={maxDetections}
              onMaxDetectionsChange={setMaxDetections}
              modelName={modelName}
              device={device}
            />
          </div>
        ) : (
          /* UPLOAD IMAGE DETECTION STUDIO */
          <div className="flex-1 flex flex-col xl:flex-row min-w-0 p-4 sm:p-6 gap-6">
            {/* Left: Image Canvas & Upload Box */}
            <div className="flex-1 flex flex-col space-y-4 min-w-0">
              <div className="relative w-full aspect-video bg-background-secondary rounded-2xl border border-border overflow-hidden shadow-2xl flex items-center justify-center group min-h-[380px]">
                {uploadedImageSrc ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <canvas
                      ref={uploadCanvasRef}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                    />
                    {isProcessingUpload && (
                      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
                        <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
                        <span className="text-xs font-semibold text-white">Running YOLO Inference...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 text-center cursor-pointer border-2 border-dashed border-border hover:border-brand-blue/60 rounded-2xl transition-all m-6 w-full max-w-lg"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto mb-4 text-brand-cyan group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Click to Upload or Drag & Drop Image</h3>
                    <p className="text-xs text-content-secondary max-w-xs mb-4">
                      Supports JPG, PNG, WEBP. YOLO AI will automatically locate, classify, and box all objects.
                    </p>
                    <span className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright shadow-glow-sm">
                      Select Photo
                    </span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Upload Controls Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-background-panel p-3.5 rounded-xl border border-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-background-secondary border border-border hover:bg-white/[0.04] transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Upload New Image</span>
                  </button>

                  {uploadedImageSrc && (
                    <button
                      onClick={handleReanalyzeUpload}
                      disabled={isProcessingUpload}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-bright disabled:opacity-50 transition-all shadow-glow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessingUpload ? 'animate-spin' : ''}`} />
                      <span>Re-Analyze</span>
                    </button>
                  )}
                </div>

                {uploadStats && (
                  <div className="flex items-center gap-4 text-xs font-mono text-content-secondary">
                    <span>
                      Objects: <strong className="text-white">{uploadStats.objectCount}</strong>
                    </span>
                    <span>
                      Latency: <strong className="text-brand-cyan">{uploadStats.inferenceTimeMs}ms</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Upload Telemetry & Detected Classes List */}
            <div className="w-full xl:w-80 flex flex-col space-y-4 shrink-0">
              {/* Parameter Sliders */}
              <div className="bg-background-panel border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Detection Parameters</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-content-secondary">Confidence</span>
                      <span className="font-mono text-brand-cyan font-semibold">
                        {Math.round(confidenceThreshold * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.95"
                      step="0.05"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-background-secondary rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-content-secondary">IoU NMS Threshold</span>
                      <span className="font-mono text-brand-cyan font-semibold">
                        {Math.round(iouThreshold * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.90"
                      step="0.05"
                      value={iouThreshold}
                      onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-background-secondary rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Detected Objects List */}
              <div className="flex-1 bg-background-panel border border-border rounded-xl p-4 flex flex-col min-h-[220px]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Detected Objects</span>
                  <span className="text-[11px] font-mono text-brand-cyan font-semibold px-2 py-0.5 rounded bg-brand-cyan/10">
                    {uploadDetections.length} items
                  </span>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-[320px] pr-1">
                  {uploadDetections.length > 0 ? (
                    uploadDetections.map((box, index) => {
                      const color = getObjectColor(box.class_name);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-background-secondary border border-border text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="font-bold text-white capitalize">{box.class_name}</span>
                          </div>
                          <span className="font-mono text-xs text-content-secondary font-semibold">
                            {Math.round(box.confidence * 100)}%
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-content-muted">
                      <Info className="w-6 h-6 mb-2 text-content-muted" />
                      <p className="text-xs">No objects detected yet. Upload a photo to run detection.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudioLayout>
  );
};
