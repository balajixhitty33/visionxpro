export function formatConfidence(confidence: number): string {
  const pct = confidence <= 1.0 ? confidence * 100 : confidence;
  return `${pct.toFixed(1)}%`;
}

export function formatLatency(latencyMs: number): string {
  return `${Math.round(latencyMs)}ms`;
}

export function formatFPS(fps: number): string {
  return `${Math.round(fps)} FPS`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
