export interface DetectionBox {
  class_id: number;
  class_name: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  norm_x: number;
  norm_y: number;
  norm_width: number;
  norm_height: number;
  track_id?: number | null;
}

export interface DetectionResponse {
  success: boolean;
  objects: DetectionBox[];
  object_count: number;
  average_confidence: number;
  processing_time_ms: number;
  fps: number;
  image_width: number;
  image_height: number;
  class_counts: Record<string, number>;
  model: string;
  device: string;
  error?: string;
}

export interface CapturedResult {
  id: string;
  session_id?: string;
  timestamp: string;
  image_path: string;
  thumbnail_path?: string;
  width: number;
  height: number;
  object_count: number;
  average_confidence: number;
  processing_time_ms: number;
  fps: number;
  model_used: string;
  detected_classes_summary: string;
  objects: DetectionBox[];
}

export interface ClassDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AnalyticsData {
  total_sessions: number;
  total_objects_detected: number;
  average_confidence: number;
  average_fps: number;
  average_latency_ms: number;
  total_captures: number;
  class_distribution: ClassDistribution[];
  accuracy_trend: { time: string; accuracy: number; fps: number }[];
  fps_trend: { timestamp: string; fps: number; latency: number }[];
  recent_sessions: SessionRecord[];
}

export interface SessionRecord {
  id: string;
  session_number: number;
  started_at: string;
  duration_seconds: number;
  total_frames: number;
  avg_fps: number;
  avg_latency: number;
  avg_confidence: number;
  detected_classes: string;
  status: string;
  model_used: string;
}

export interface UserSettings {
  camera_id: string;
  resolution_width: number;
  resolution_height: number;
  target_fps: number;
  model_name: string;
  confidence_threshold: number;
  iou_threshold: number;
  max_detections: number;
  device: string;
  detection_overlay: boolean;
  show_labels: boolean;
  show_confidence: boolean;
  sound_notifications: boolean;
  theme: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  size_mb: number;
  parameters: string;
  speed: string;
  mAP: string;
  description: string;
  recommended: boolean;
}

export interface QRItem {
  text: string;
  type: string;
  points?: number[][];
  x: number;
  y: number;
  width: number;
  height: number;
  norm_x: number;
  norm_y: number;
  norm_width: number;
  norm_height: number;
}

export interface QRScanResponse {
  success: boolean;
  qr_count: number;
  results: QRItem[];
  image_width: number;
  image_height: number;
  error?: string;
}

export interface QRGenerateResponse {
  success: boolean;
  data_url: string;
  data: string;
  type: string;
  size: number;
  error?: string;
}

export interface QRHistoryItem {
  id: string;
  text: string;
  type: string;
  timestamp: string;
}

export type CameraStatus =
  | 'idle'
  | 'starting'
  | 'active'
  | 'detecting'
  | 'paused'
  | 'stopped'
  | 'permission_denied'
  | 'not_found'
  | 'error';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
