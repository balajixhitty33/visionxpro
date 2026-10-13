import React, { useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, RefreshCw, Eye, Pause, Play, ShieldAlert } from 'lucide-react';
import { CameraStatus, DetectionBox } from '../../types';
import { getObjectColor, hexToRgba } from '../../utils/colors';

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  errorMessage: string | null;
  detections: DetectionBox[];
  isDetecting: boolean;
  isPaused: boolean;
  onStartCamera: () => void;
  onRetry: () => void;
  resolution: { width: number; height: number };
  onResolutionChange: (width: number, height: number) => void;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onDeviceChange: (id: string) => void;
  isCapturing?: boolean;
}

export const CameraWorkspace: React.FC<Props> = ({
  videoRef,
  status,
  errorMessage,
  detections,
  isDetecting,
  isPaused,
  onStartCamera,
  onRetry,
  resolution,
  onResolutionChange,
  devices,
  selectedDeviceId,
  onDeviceChange,
  isCapturing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Draw bounding boxes dynamically on canvas synchronized with video dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Synchronize canvas size with video or container
    const width = video.videoWidth || canvas.clientWidth || 1280;
    const height = video.videoHeight || canvas.clientHeight || 720;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    if (status !== 'active' && status !== 'detecting') {
      return;
    }

    if (isPaused) {
      // Draw watermark for paused state
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    // Render detections
    detections.forEach((box) => {
      // Calculate coordinates scaled to canvas accurately
      const x = box.norm_x !== undefined && box.norm_x !== null ? box.norm_x * width : box.x;
      const y = box.norm_y !== undefined && box.norm_y !== null ? box.norm_y * height : box.y;
      const w = box.norm_width !== undefined && box.norm_width !== null ? box.norm_width * width : box.width;
      const h = box.norm_height !== undefined && box.norm_height !== null ? box.norm_height * height : box.height;

      const color = getObjectColor(box.class_name);
      const confPct = box.confidence <= 1.0 ? Math.round(box.confidence * 100) : Math.round(box.confidence);
      const label = `${box.class_name.toUpperCase()} ${confPct}%`;

      // 1. Draw glowing outer bounding box
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0; // Reset

      // 2. Draw subtle translucent fill
      ctx.fillStyle = hexToRgba(color, 0.08);
      ctx.fillRect(x, y, w, h);

      // 3. Draw corner brackets
      const cornerSize = Math.min(14, w * 0.2, h * 0.2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x, y + cornerSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerSize, y);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerSize, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerSize);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerSize);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerSize, y + h);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerSize, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerSize);
      ctx.stroke();

      // 4. Draw Label Badge
      ctx.font = 'bold 12px "JetBrains Mono", Inter, monospace';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const badgeHeight = 22;
      const badgeWidth = textWidth + 16;
      const badgeY = Math.max(0, y - badgeHeight);

      // Label background pill
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, badgeY, badgeWidth, badgeHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, x + 8, badgeY + 15);
    });
  }, [detections, status, isPaused, videoRef]);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 min-w-0 space-y-4">
      {/* Workspace Header & Camera Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-background-panel px-4 py-3 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-white tracking-tight">Live Detection</h2>
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-background-secondary border border-border text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'active' || status === 'detecting'
                  ? isPaused
                    ? 'bg-status-warning animate-pulse'
                    : 'bg-status-success shadow-[0_0_8px_#22c55e]'
                  : 'bg-content-muted'
              }`}
            />
            <span className="text-[11px] text-content-secondary">
              {status === 'active' || status === 'detecting'
                ? isPaused
                  ? 'Detection Paused'
                  : 'Camera Active'
                : 'Camera Offline'}
            </span>
          </div>
        </div>

        {/* Compact Camera Controls */}
        <div className="flex items-center gap-3 text-xs">
          {/* Resolution selector */}
          <div className="flex items-center gap-1.5 text-content-secondary">
            <span className="text-[11px]">Res:</span>
            <select
              value={`${resolution.width}x${resolution.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                onResolutionChange(w, h);
              }}
              className="bg-background-secondary border border-border text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-brand-blue"
            >
              <option value="1280x720">1280 × 720 (HD)</option>
              <option value="1920x1080">1920 × 1080 (FHD)</option>
              <option value="640x480">640 × 480 (SD)</option>
            </select>
          </div>

          {/* Camera device selector */}
          {devices.length > 1 && (
            <div className="flex items-center gap-1.5 text-content-secondary">
              <span className="text-[11px]">Source:</span>
              <select
                value={selectedDeviceId}
                onChange={(e) => onDeviceChange(e.target.value)}
                className="bg-background-secondary border border-border text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-brand-blue max-w-[130px] truncate"
              >
                {devices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Camera Viewport (Large 16:9 area) */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-background-secondary rounded-2xl border border-border overflow-hidden shadow-2xl flex items-center justify-center group"
      >
        {/* Flash effect on capture */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white/40 z-30 transition-opacity duration-200 pointer-events-none" />
        )}

        {/* Real Webcam Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain ${
            status === 'active' || status === 'detecting' ? 'block' : 'hidden'
          }`}
        />

        {/* Canvas Overlay for YOLO Bounding Boxes */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none z-10 ${
            status === 'active' || status === 'detecting' ? 'block' : 'hidden'
          }`}
        />

        {/* Camera States & Overlay Screens */}
        {status === 'idle' && (
          <div className="text-center p-8 space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto shadow-glow-sm">
              <Camera className="w-8 h-8 text-brand-cyan" />
            </div>
            <h3 className="text-lg font-bold text-white">Camera Ready</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Click Start Camera below to activate your webcam and initiate real-time AI object detection.
            </p>
            <button
              onClick={onStartCamera}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 shadow-glow-sm active:scale-95 transition-all"
            >
              Start Camera
            </button>
          </div>
        )}

        {status === 'starting' && (
          <div className="text-center p-8 space-y-3">
            <RefreshCw className="w-10 h-10 text-brand-cyan animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-white">Starting Camera...</h3>
            <p className="text-xs text-content-secondary">Initializing WebRTC video stream</p>
          </div>
        )}

        {status === 'stopped' && (
          <div className="text-center p-8 space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-border flex items-center justify-center mx-auto">
              <CameraOff className="w-8 h-8 text-content-muted" />
            </div>
            <h3 className="text-base font-bold text-white">Camera Stopped</h3>
            <p className="text-xs text-content-secondary">Video stream is currently inactive.</p>
            <button
              onClick={onStartCamera}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-bright transition-all"
            >
              Restart Camera
            </button>
          </div>
        )}

        {status === 'permission_denied' && (
          <div className="text-center p-8 space-y-4 max-w-md bg-status-danger/10 border border-status-danger/20 rounded-2xl m-4">
            <div className="w-14 h-14 rounded-2xl bg-status-danger/20 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7 text-status-danger" />
            </div>
            <h3 className="text-base font-bold text-white">Camera Permission Required</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Please allow camera access in your browser settings to start object detection.
            </p>
            <button
              onClick={onRetry}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-status-danger hover:bg-status-danger/90 transition-all shadow-sm"
            >
              Retry Access
            </button>
          </div>
        )}

        {status === 'not_found' && (
          <div className="text-center p-8 space-y-4 max-w-md bg-status-warning/10 border border-status-warning/20 rounded-2xl m-4">
            <div className="w-14 h-14 rounded-2xl bg-status-warning/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-status-warning" />
            </div>
            <h3 className="text-base font-bold text-white">Camera Not Available</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              No compatible webcam or video device was detected on your system.
            </p>
            <button
              onClick={onRetry}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-status-warning hover:bg-status-warning/90 transition-all text-black font-bold"
            >
              Detect Again
            </button>
          </div>
        )}

        {/* Live Active HUD Overlays */}
        {(status === 'active' || status === 'detecting') && (
          <>
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-lg bg-background-panel/85 backdrop-blur-md border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-status-success animate-ping" />
              <span className="text-white font-medium">LIVE STREAM</span>
            </div>

            {isPaused && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-lg bg-status-warning/20 backdrop-blur-md border border-status-warning/40 text-xs font-mono text-status-warning">
                <Pause className="w-3.5 h-3.5" />
                <span>DETECTION PAUSED</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
