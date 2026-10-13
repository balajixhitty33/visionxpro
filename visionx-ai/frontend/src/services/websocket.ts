import { DetectionResponse } from '../types';

export class DetectionWebSocket {
  private socket: WebSocket | null = null;
  private onResultCallback: ((result: DetectionResponse) => void) | null = null;
  private onErrorCallback: ((error: Event | Error) => void) | null = null;
  private isConnecting = false;

  constructor(
    private url: string = (
      import.meta.env.VITE_WS_URL ||
      (import.meta.env.VITE_API_URL
        ? `${(import.meta.env.VITE_API_URL as string).replace(/^http/, 'ws').replace(/\/$/, '')}/ws/detection`
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/detection`)
    )
  ) {}

  connect(onResult: (result: DetectionResponse) => void, onError?: (error: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.onResultCallback = onResult;
      this.onErrorCallback = onError || null;

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          this.isConnecting = false;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data: DetectionResponse = JSON.parse(event.data);
            if (this.onResultCallback) {
              this.onResultCallback(data);
            }
          } catch (err) {
            console.error('Failed to parse WS detection payload', err);
          }
        };

        this.socket.onerror = (event) => {
          this.isConnecting = false;
          if (this.onErrorCallback) {
            this.onErrorCallback(event);
          }
          reject(event);
        };

        this.socket.onclose = () => {
          this.isConnecting = false;
        };
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  sendFrame(imageBase64: string, confThreshold: number = 0.25, iouThreshold: number = 0.45, maxDetections: number = 30) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          image: imageBase64,
          conf_threshold: confThreshold,
          iou_threshold: iouThreshold,
          max_detections: maxDetections,
        })
      );
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
