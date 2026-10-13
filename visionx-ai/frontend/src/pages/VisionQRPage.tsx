import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StudioLayout } from '../layouts/StudioLayout';
import {
  QrCode,
  Camera,
  CameraOff,
  Upload,
  Sparkles,
  Copy,
  ExternalLink,
  Download,
  Wifi,
  Mail,
  User,
  FileText,
  Check,
  RefreshCw,
  Trash2,
  Share2,
  Sliders,
  Layers,
  History
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';
import { useCamera } from '../hooks/useCamera';
import { api } from '../services/api';
import { QRItem, QRHistoryItem } from '../types';
import { toast } from '../hooks/useToast';

export const VisionQRPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'upload' | 'generator' | 'history'>('scanner');
  
  // Scanner state
  const { videoRef, status, startCamera, stopCamera, captureFrame } = useCamera();
  const [scannedQR, setScannedQR] = useState<QRItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<number | null>(null);

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadQR, setUploadQR] = useState<QRItem | null>(null);
  const [isAnalyzingUpload, setIsAnalyzingUpload] = useState(false);

  // Generator state
  const [qrType, setQrType] = useState<'url' | 'text' | 'wifi' | 'email'>('url');
  const [urlInput, setUrlInput] = useState('https://visionx.ai');
  const [textInput, setTextInput] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiSec, setWifiSec] = useState('WPA');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [qrFgColor, setQrFgColor] = useState('#2F80FF');
  const [qrBgColor, setQrBgColor] = useState('#0D1728');
  const [qrLevel, setQrLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrSize, setQrSize] = useState(256);

  // History state
  const [history, setHistory] = useState<QRHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('visionx_qr_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToHistory = useCallback((text: string, type: string) => {
    if (!text) return;
    setHistory((prev) => {
      // Avoid duplicate immediately adjacent
      if (prev.length > 0 && prev[0].text === text) return prev;
      const newItem: QRHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        text,
        type,
        timestamp: new Date().toISOString(),
      };
      const updated = [newItem, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('visionx_qr_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Client + Backend live QR frame scanning loop
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);

    // Fast client-side QR decode with jsQR
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      const qrData: QRItem = {
        text: code.data,
        type: code.data.startsWith('http') ? 'url' : code.data.startsWith('WIFI:') ? 'wifi' : 'text',
        x: code.location.topLeftCorner.x,
        y: code.location.topLeftCorner.y,
        width: Math.abs(code.location.topRightCorner.x - code.location.topLeftCorner.x),
        height: Math.abs(code.location.bottomLeftCorner.y - code.location.topLeftCorner.y),
        norm_x: code.location.topLeftCorner.x / w,
        norm_y: code.location.topLeftCorner.y / h,
        norm_width: Math.abs(code.location.topRightCorner.x - code.location.topLeftCorner.x) / w,
        norm_height: Math.abs(code.location.bottomLeftCorner.y - code.location.topLeftCorner.y) / h,
      };

      setScannedQR(qrData);
      saveToHistory(code.data, qrData.type);

      // Draw tracking locator box
      ctx.strokeStyle = '#18C8FF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
      ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
      ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
      ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = 'rgba(24, 200, 255, 0.2)';
      ctx.fill();
    }
  }, [videoRef, saveToHistory]);

  // Handle Scanner Start / Stop
  const handleStartScanner = async () => {
    try {
      await startCamera({ width: 1280, height: 720 });
      setIsScanning(true);
      toast('info', 'QR Scanner Active', 'Point your camera at any QR code.');
    } catch (err: any) {
      toast('error', 'Camera Error', err.message || 'Could not start camera.');
    }
  };

  const handleStopScanner = () => {
    stopCamera();
    setIsScanning(false);
  };

  useEffect(() => {
    if (activeTab === 'scanner' && (status === 'active' || status === 'detecting')) {
      loopRef.current = window.setInterval(scanVideoFrame, 120);
    } else {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    }
    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [activeTab, status, scanVideoFrame]);

  // Handle File Upload Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingUpload(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      setUploadedImage(b64);

      try {
        const res = await api.scanQRCode(b64);
        if (res.success && res.results.length > 0) {
          const item = res.results[0];
          setUploadQR(item);
          saveToHistory(item.text, item.type);
          toast('success', 'QR Code Decoded', item.text);
        } else {
          setUploadQR(null);
          toast('warning', 'No QR Code Detected', 'Try uploading a clearer image.');
        }
      } catch (err: any) {
        toast('error', 'Scan Failed', err.message || 'Could not scan image.');
      } finally {
        setIsAnalyzingUpload(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Compute QR Payload string for generator
  const getGeneratorPayload = (): string => {
    if (qrType === 'url') return urlInput.trim() || 'https://visionx.ai';
    if (qrType === 'text') return textInput.trim() || 'VisionX AI Computer Vision';
    if (qrType === 'wifi') return `WIFI:T:${wifiSec};S:${wifiSSID};P:${wifiPass};;`;
    if (qrType === 'email') return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
    return 'https://visionx.ai';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('success', 'Copied to Clipboard', text);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('generated-qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `visionx_qr_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('success', 'QR Code Downloaded', 'Saved as high-res PNG.');
  };

  return (
    <StudioLayout>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <QrCode className="w-6 h-6 text-brand-cyan" />
              <span>Vision QR Studio</span>
            </h2>
            <p className="text-sm text-content-secondary">
              Real-time computer vision QR code scanner, batch reader, and high-resolution generator.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background-panel border border-border text-xs font-semibold">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'scanner'
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'text-content-secondary hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'text-content-secondary hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'generator'
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'text-content-secondary hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-brand-blue text-white shadow-glow-sm'
                  : 'text-content-secondary hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({history.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE SCANNER */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Camera Feed & Canvas Locator */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative aspect-video bg-background-secondary rounded-2xl border border-border overflow-hidden shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    status === 'active' || status === 'detecting' ? 'block' : 'hidden'
                  }`}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full pointer-events-none ${
                    status === 'active' || status === 'detecting' ? 'block' : 'hidden'
                  }`}
                />

                {status !== 'active' && status !== 'detecting' && (
                  <div className="text-center p-8 space-y-4 max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto">
                      <QrCode className="w-7 h-7 text-brand-cyan" />
                    </div>
                    <h3 className="text-base font-bold text-white">QR Code Scanner Ready</h3>
                    <p className="text-xs text-content-secondary">
                      Activate camera to scan URLs, Wi-Fi credentials, and contact cards instantly.
                    </p>
                    <button
                      onClick={handleStartScanner}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 shadow-glow-sm transition-all"
                    >
                      Start Camera Scanner
                    </button>
                  </div>
                )}

                {(status === 'active' || status === 'detecting') && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-background-panel/90 backdrop-blur-md border border-white/10 text-xs font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                    <span>SCANNING FOR QR CODES</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background-panel border border-border">
                <span className="text-xs text-content-secondary font-mono">
                  Engine: OpenCV QR + jsQR Double Tracker
                </span>
                {status === 'active' || status === 'detecting' ? (
                  <button
                    onClick={handleStopScanner}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-status-danger bg-status-danger/10 border border-status-danger/20 hover:bg-status-danger/20 transition-all"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartScanner}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-bright transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Scanner</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Decoded Result Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-success" />
                  <span>Decoded Result</span>
                </h3>

                {scannedQR ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-background-secondary border border-brand-cyan/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan font-bold">
                          {scannedQR.type}
                        </span>
                        <span className="text-[10px] text-content-muted font-mono">Just Now</span>
                      </div>
                      <p className="text-xs font-mono text-white break-all bg-black/40 p-2.5 rounded-lg border border-white/5">
                        {scannedQR.text}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {scannedQR.text.startsWith('http') && (
                        <a
                          href={scannedQR.text}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-bright transition-all shadow-glow-sm"
                        >
                          <span>Open URL</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => handleCopy(scannedQR.text)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-content-secondary hover:text-white bg-background-secondary border border-border hover:bg-white/[0.04] transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy to Clipboard</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-background-secondary/50 border border-dashed border-white/10 text-xs text-content-muted space-y-2">
                    <QrCode className="w-8 h-8 mx-auto text-content-muted/60" />
                    <p>No QR code in camera view yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD IMAGE SCAN */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              <label className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-white/15 bg-background-secondary hover:border-brand-cyan/50 hover:bg-background-panel transition-all cursor-pointer p-8 text-center relative overflow-hidden group">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7 text-brand-cyan" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Click or drag image here</h4>
                      <p className="text-xs text-content-secondary mt-1">
                        Supports PNG, JPG, JPEG, WEBP containing QR codes
                      </p>
                    </div>
                  </div>
                )}

                {isAnalyzingUpload && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
                  </div>
                )}
              </label>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-success" />
                  <span>Decoded Payload</span>
                </h3>

                {uploadQR ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-background-secondary border border-brand-cyan/30 space-y-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan font-bold">
                        {uploadQR.type}
                      </span>
                      <p className="text-xs font-mono text-white break-all bg-black/40 p-2.5 rounded-lg border border-white/5">
                        {uploadQR.text}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {uploadQR.text.startsWith('http') && (
                        <a
                          href={uploadQR.text}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-bright transition-all shadow-glow-sm"
                        >
                          <span>Open URL</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => handleCopy(uploadQR.text)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-content-secondary hover:text-white bg-background-secondary border border-border hover:bg-white/[0.04] transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Payload</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-background-secondary/50 border border-dashed border-white/10 text-xs text-content-muted">
                    Upload an image to inspect and decode.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QR CODE GENERATOR */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Generator Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl bg-background-panel border border-border space-y-6 shadow-card">
                {/* Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-content-muted">
                    Payload Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'url', label: 'Website URL', icon: <ExternalLink className="w-3.5 h-3.5" /> },
                      { id: 'text', label: 'Plain Text', icon: <FileText className="w-3.5 h-3.5" /> },
                      { id: 'wifi', label: 'Wi-Fi Network', icon: <Wifi className="w-3.5 h-3.5" /> },
                      { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setQrType(t.id as any)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          qrType === t.id
                            ? 'bg-brand-blue/15 border-brand-blue text-brand-cyan shadow-glow-sm'
                            : 'bg-background-secondary border-border text-content-secondary hover:text-white'
                        }`}
                      >
                        {t.icon}
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields based on Type */}
                <div className="space-y-3">
                  {qrType === 'url' && (
                    <div>
                      <label className="text-xs text-content-secondary block mb-1">Target URL</label>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-3 outline-none focus:border-brand-blue font-mono"
                      />
                    </div>
                  )}

                  {qrType === 'text' && (
                    <div>
                      <label className="text-xs text-content-secondary block mb-1">Plain Text</label>
                      <textarea
                        rows={3}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type any message, note, or serial key..."
                        className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-3 outline-none focus:border-brand-blue font-mono"
                      />
                    </div>
                  )}

                  {qrType === 'wifi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-content-secondary block mb-1">Network SSID</label>
                        <input
                          type="text"
                          value={wifiSSID}
                          onChange={(e) => setWifiSSID(e.target.value)}
                          placeholder="MyHomeWiFi"
                          className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-3 outline-none focus:border-brand-blue font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-content-secondary block mb-1">Password</label>
                          <input
                            type="text"
                            value={wifiPass}
                            onChange={(e) => setWifiPass(e.target.value)}
                            placeholder="WiFiPassword123"
                            className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-3 outline-none focus:border-brand-blue font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-content-secondary block mb-1">Security</label>
                          <select
                            value={wifiSec}
                            onChange={(e) => setWifiSec(e.target.value)}
                            className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-3 outline-none focus:border-brand-blue font-mono"
                          >
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">None (Open)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {qrType === 'email' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-content-secondary block mb-1">Recipient Email</label>
                        <input
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="contact@visionx.ai"
                          className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-3 outline-none focus:border-brand-blue font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-content-secondary block mb-1">Subject</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Inquiry"
                          className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-3 outline-none focus:border-brand-blue font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Color & Styling Customizer */}
                <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-content-secondary block mb-1.5">Foreground Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={qrFgColor}
                        onChange={(e) => setQrFgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <span className="font-mono text-white text-xs">{qrFgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-content-secondary block mb-1.5">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <span className="font-mono text-white text-xs">{qrBgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-content-secondary block mb-1.5">Error Correction</label>
                    <select
                      value={qrLevel}
                      onChange={(e) => setQrLevel(e.target.value as any)}
                      className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-2 outline-none focus:border-brand-blue font-mono"
                    >
                      <option value="L">L (7% Recovery)</option>
                      <option value="M">M (15% Standard)</option>
                      <option value="Q">Q (25% High)</option>
                      <option value="H">H (30% Maximum)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Live QR Preview & Export */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-background-panel border border-border space-y-6 shadow-card flex flex-col items-center text-center">
                <h3 className="text-sm font-bold text-white">Live QR Code Preview</h3>

                {/* Rendered Canvas */}
                <div
                  className="p-5 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center"
                  style={{ backgroundColor: qrBgColor }}
                >
                  <QRCodeCanvas
                    id="generated-qr-canvas"
                    value={getGeneratorPayload()}
                    size={qrSize}
                    fgColor={qrFgColor}
                    bgColor={qrBgColor}
                    level={qrLevel}
                    includeMargin={true}
                  />
                </div>

                <p className="text-[11px] font-mono text-content-muted break-all max-w-xs">
                  {getGeneratorPayload()}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 shadow-glow-sm active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleCopy(getGeneratorPayload())}
                    className="p-3 rounded-xl bg-background-secondary border border-border text-content-secondary hover:text-white hover:bg-white/[0.04] transition-all"
                    title="Copy Payload Text"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCAN HISTORY */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-brand-cyan" />
                <span>QR Scan Logs</span>
              </h3>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('visionx_qr_history');
                    toast('info', 'History Cleared');
                  }}
                  className="flex items-center gap-1.5 text-xs text-content-muted hover:text-status-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-background-secondary/50 border border-dashed border-white/10 text-xs text-content-muted">
                No QR codes scanned yet.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {history.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-blue/15 text-brand-cyan font-bold">
                          {item.type}
                        </span>
                        <span className="text-[10px] text-content-muted font-mono">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-white truncate">{item.text}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.text.startsWith('http') && (
                        <a
                          href={item.text}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-background-secondary border border-border text-brand-cyan hover:bg-brand-cyan/10 transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleCopy(item.text)}
                        className="p-2 rounded-lg bg-background-secondary border border-border text-content-secondary hover:text-white transition-colors"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </StudioLayout>
  );
};
