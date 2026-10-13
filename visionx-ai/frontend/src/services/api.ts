import {
  DetectionResponse,
  CapturedResult,
  AnalyticsData,
  SessionRecord,
  UserSettings,
  ModelInfo,
  QRScanResponse,
  QRGenerateResponse,
} from '../types';

// Intelligent API base routing:
// - When running locally (localhost, 127.0.0.1, LAN IP), route via Vite /api proxy to local fast Python backend
// - When deployed to cloud (Vercel), route to production Render backend
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.'));

const API_BASE = isLocal
  ? '/api'
  : import.meta.env.VITE_API_URL
  ? `${(import.meta.env.VITE_API_URL as string).replace(/\/$/, '')}/api`
  : '/api';

export const api = {
  // System Health
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Detection
  async detectFrame(
    image: string,
    confThreshold: number = 0.25,
    iouThreshold: number = 0.45,
    maxDetections: number = 30,
    model?: string
  ): Promise<DetectionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          confidence_threshold: confThreshold,
          iou_threshold: iouThreshold,
          max_detections: maxDetections,
          model,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Detection failed' }));
        throw new Error(err.detail || 'Detection failed');
      }
      return res.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('AI backend server timed out. Cloud instance may be waking up.');
      }
      throw err;
    }
  },

  // Vision QR Endpoints
  async scanQR(image: string): Promise<QRScanResponse> {
    const res = await fetch(`${API_BASE}/qr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'QR scan failed' }));
      throw new Error(err.detail || 'QR scan failed');
    }
    return res.json();
  },

  async scanQRCode(image: string | File): Promise<QRScanResponse> {
    if (typeof image === 'string') {
      return this.scanQR(image);
    } else {
      return this.uploadAndScanQR(image);
    }
  },

  async uploadAndScanQR(file: File): Promise<QRScanResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/qr/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'QR upload failed' }));
      throw new Error(err.detail || 'QR upload failed');
    }
    return res.json();
  },

  async generateQR(
    data: string,
    fillColor: string = '#2F80FF',
    backColor: string = '#0D1728',
    size: number = 10,
    errorCorrection: string = 'M'
  ): Promise<QRGenerateResponse> {
    const res = await fetch(`${API_BASE}/qr/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        fill_color: fillColor,
        back_color: backColor,
        size,
        error_correction: errorCorrection,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'QR generation failed' }));
      throw new Error(err.detail || 'QR generation failed');
    }
    return res.json();
  },

  // Captures / Results
  async captureSnapshot(
    image: string,
    confThreshold: number = 0.25,
    iouThreshold: number = 0.45,
    sessionId?: string,
    model?: string
  ): Promise<CapturedResult> {
    const res = await fetch(`${API_BASE}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image,
        confidence_threshold: confThreshold,
        iou_threshold: iouThreshold,
        session_id: sessionId,
        model,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to capture snapshot' }));
      throw new Error(err.detail || 'Failed to capture snapshot');
    }
    return res.json();
  },

  async getResults(limit: number = 50, offset: number = 0): Promise<CapturedResult[]> {
    const res = await fetch(`${API_BASE}/results?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  },

  async getResultById(id: string): Promise<CapturedResult> {
    const res = await fetch(`${API_BASE}/results/${id}`);
    if (!res.ok) throw new Error('Result not found');
    return res.json();
  },

  async deleteResult(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/results/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete result');
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // History
  async getHistory(): Promise<SessionRecord[]> {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async deleteHistorySession(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete session');
    return res.json();
  },

  // Models
  async getModels(): Promise<{
    current_model: string;
    current_device: string;
    is_loaded: boolean;
    classes?: Record<number, string>;
    class_count?: number;
    available_models: ModelInfo[];
  }> {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },

  async loadModel(modelName: string, device: string = 'auto'): Promise<any> {
    const res = await fetch(`${API_BASE}/models/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_name: modelName, device }),
    });
    if (!res.ok) throw new Error('Failed to load model');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<UserSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};
