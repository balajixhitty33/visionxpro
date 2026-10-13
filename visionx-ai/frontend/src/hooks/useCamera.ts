import { useState, useRef, useCallback, useEffect } from 'react';
import { CameraStatus } from '../types';

interface CameraOptions {
  width?: number;
  height?: number;
  facingMode?: string;
}

export function useCamera() {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // List available video input devices
  const updateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.warn('Error enumerating devices', err);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    updateDevices();
  }, [updateDevices]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('stopped');
  }, []);

  // Start Real Hardware Camera with multi-tier progressive fallback
  const startCamera = useCallback(
    async (options?: CameraOptions) => {
      setStatus('starting');
      setErrorMessage(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('not_found');
        setErrorMessage('Camera API is not supported in this browser.');
        return;
      }

      let stream: MediaStream | null = null;
      let lastErr: any = null;

      // Tier 1: Try requested resolution & deviceId
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId ? { ideal: selectedDeviceId } : undefined,
            width: { ideal: options?.width || 1280 },
            height: { ideal: options?.height || 720 },
          },
          audio: false,
        });
      } catch (err1: any) {
        lastErr = err1;
        console.warn('Tier 1 constraint failed, trying Tier 2 fallback...', err1);
      }

      // Tier 2: Try basic ideal resolution without deviceId
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (err2: any) {
          lastErr = err2;
          console.warn('Tier 2 constraint failed, trying Tier 3 fallback...', err2);
        }
      }

      // Tier 3: Universal simple video constraint
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3: any) {
          lastErr = err3;
          console.error('All camera tiers failed:', err3);
        }
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play warning:', playErr);
          }
        }
        setStatus('active');
        await updateDevices();
      } else {
        if (
          lastErr?.name === 'NotAllowedError' ||
          lastErr?.name === 'PermissionDeniedError' ||
          lastErr?.message?.includes('Permission')
        ) {
          setStatus('permission_denied');
          setErrorMessage('Camera permission was denied. Please allow camera access in browser settings.');
        } else if (
          lastErr?.name === 'NotFoundError' ||
          lastErr?.name === 'DevicesNotFoundError' ||
          lastErr?.name === 'NotReadableError'
        ) {
          setStatus('not_found');
          setErrorMessage(
            lastErr?.name === 'NotReadableError'
              ? 'Camera is in use by another application. Please close Zoom/Teams/OBS and retry.'
              : 'No compatible webcam or video device was detected on your system.'
          );
        } else {
          setStatus('not_found');
          setErrorMessage(lastErr?.message || 'Failed to start camera.');
        }
      }
    },
    [selectedDeviceId, updateDevices]
  );

  // Capture single frame as Base64 JPEG
  const captureFrame = useCallback(
    (quality: number = 0.85): string | null => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        return null;
      }

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    status,
    setStatus,
    errorMessage,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    startCamera,
    stopCamera,
    captureFrame,
    isActive: status === 'active' || status === 'detecting',
  };
}
