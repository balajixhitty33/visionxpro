import React from 'react';
import { Camera, Play, Pause, CameraOff, Sparkles, RefreshCw } from 'lucide-react';
import { CameraStatus } from '../../types';

interface Props {
  status: CameraStatus;
  isDetecting: boolean;
  isPaused: boolean;
  isCapturing: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onTogglePause: () => void;
  onCapture: () => void;
}

export const CameraControlBar: React.FC<Props> = ({
  status,
  isDetecting,
  isPaused,
  isCapturing,
  onStartCamera,
  onStopCamera,
  onTogglePause,
  onCapture,
}) => {
  const isCameraActive = status === 'active' || status === 'detecting';

  return (
    <div className="bg-background-panel px-6 py-4 rounded-xl border border-border flex flex-wrap items-center justify-center sm:justify-between gap-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-semibold uppercase text-content-secondary tracking-wider">
          Camera Controls
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Start / Restart Camera */}
        {!isCameraActive ? (
          <button
            onClick={onStartCamera}
            disabled={status === 'starting'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 shadow-glow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {status === 'starting' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            <span>Start Camera</span>
          </button>
        ) : (
          <>
            {/* Pause / Resume Detection */}
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                isPaused
                  ? 'bg-status-warning/15 border-status-warning/30 text-status-warning hover:bg-status-warning/25'
                  : 'bg-background-secondary border-border text-content-secondary hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'Resume Detection' : 'Pause Detection'}</span>
            </button>

            {/* Capture Snapshot */}
            <button
              onClick={onCapture}
              disabled={isCapturing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-blue hover:opacity-95 shadow-glow-cyan active:scale-95 transition-all disabled:opacity-50"
            >
              {isCapturing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Capture</span>
            </button>

            {/* Stop Camera */}
            <button
              onClick={onStopCamera}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-status-danger hover:bg-status-danger/10 border border-status-danger/20 transition-all active:scale-95"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
