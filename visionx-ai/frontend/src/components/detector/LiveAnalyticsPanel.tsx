import React from 'react';
import { Activity, Gauge, Zap, Layers, Sliders, Box, ShieldCheck, Tag } from 'lucide-react';
import { DetectionBox } from '../../types';
import { getObjectColor } from '../../utils/colors';
import { formatConfidence, formatLatency, formatFPS } from '../../utils/formatters';

interface Props {
  objectCount: number;
  fps: number;
  latency: number;
  avgConfidence: number;
  detections: DetectionBox[];
  confidenceThreshold: number;
  onConfidenceChange: (val: number) => void;
  iouThreshold: number;
  onIouChange: (val: number) => void;
  maxDetections: number;
  onMaxDetectionsChange: (val: number) => void;
  modelName: string;
  device: string;
}

export const LiveAnalyticsPanel: React.FC<Props> = ({
  objectCount,
  fps,
  latency,
  avgConfidence,
  detections,
  confidenceThreshold,
  onConfidenceChange,
  iouThreshold,
  onIouChange,
  maxDetections,
  onMaxDetectionsChange,
  modelName,
  device,
}) => {
  // Aggregate detections by class
  const classAggregation: Record<string, { count: number; maxConf: number; color: string }> = {};

  detections.forEach((det) => {
    const name = det.class_name;
    if (!classAggregation[name]) {
      classAggregation[name] = {
        count: 0,
        maxConf: 0,
        color: getObjectColor(name),
      };
    }
    classAggregation[name].count += 1;
    if (det.confidence > classAggregation[name].maxConf) {
      classAggregation[name].maxConf = det.confidence;
    }
  });

  const aggregateList = Object.entries(classAggregation).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: data.count,
    confidence: data.maxConf,
    color: data.color,
  }));

  return (
    <div className="w-full lg:w-80 bg-background-panel border-l border-border flex flex-col p-4 sm:p-5 space-y-6 overflow-y-auto shrink-0">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-cyan" />
          <span>Live Detection</span>
        </h3>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-brand-blue/10 text-brand-cyan border border-brand-blue/20 uppercase">
          {modelName}
        </span>
      </div>

      {/* Main KPI Card: Objects Detected */}
      <div className="p-4 rounded-xl bg-background-secondary border border-border text-center space-y-1 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 rounded-full blur-xl pointer-events-none" />
        <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
          {objectCount}
        </div>
        <div className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
          Objects Detected
        </div>
      </div>

      {/* 3 Telemetry Metrics Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* FPS */}
        <div className="p-2.5 rounded-lg bg-background-secondary border border-border text-center">
          <div className="text-[10px] font-mono text-content-secondary uppercase">FPS</div>
          <div className="text-base font-bold font-mono text-status-success mt-0.5">
            {fps > 0 ? fps : '--'}
          </div>
        </div>

        {/* Latency */}
        <div className="p-2.5 rounded-lg bg-background-secondary border border-border text-center">
          <div className="text-[10px] font-mono text-content-secondary uppercase">Latency</div>
          <div className="text-base font-bold font-mono text-brand-blue-bright mt-0.5">
            {latency > 0 ? `${Math.round(latency)}ms` : '--'}
          </div>
        </div>

        {/* Confidence */}
        <div className="p-2.5 rounded-lg bg-background-secondary border border-border text-center">
          <div className="text-[10px] font-mono text-content-secondary uppercase">Confidence</div>
          <div className="text-base font-bold font-mono text-brand-cyan mt-0.5">
            {avgConfidence > 0 ? formatConfidence(avgConfidence) : '--'}
          </div>
        </div>
      </div>

      {/* Detected Objects List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-content-secondary font-medium">
          <span className="uppercase font-mono text-[11px] text-content-muted">Detected Objects</span>
          <span className="font-mono text-[11px] text-brand-cyan">{aggregateList.length} Classes</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {aggregateList.length === 0 ? (
            <div className="p-4 rounded-lg bg-background-secondary/50 border border-dashed border-white/10 text-center text-xs text-content-muted">
              No objects in view
            </div>
          ) : (
            aggregateList.map((item) => (
              <div
                key={item.name}
                className="p-2.5 rounded-lg bg-background-secondary border border-border space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-white">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-content-secondary">
                      ×{item.count}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-brand-cyan font-medium">
                    {formatConfidence(item.confidence)}
                  </span>
                </div>

                {/* Progress bar for confidence */}
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, item.confidence * 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Parameters Sliders */}
      <div className="space-y-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-content-muted">
          <Sliders className="w-3.5 h-3.5 text-brand-blue" />
          <span>Parameters</span>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-secondary">Confidence Threshold</span>
            <span className="font-mono font-bold text-white">
              {Math.round(confidenceThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.95"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-background-secondary rounded-lg appearance-none cursor-pointer accent-brand-blue"
          />
        </div>

        {/* IoU NMS Threshold */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-secondary">IoU Threshold</span>
            <span className="font-mono font-bold text-white">
              {Math.round(iouThreshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.05"
            value={iouThreshold}
            onChange={(e) => onIouChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-background-secondary rounded-lg appearance-none cursor-pointer accent-brand-blue"
          />
        </div>

        {/* Max Detections */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-content-secondary">Max Detections</span>
          <select
            value={maxDetections}
            onChange={(e) => onMaxDetectionsChange(parseInt(e.target.value, 10))}
            className="bg-background-secondary border border-border text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-brand-blue font-mono"
          >
            <option value="10">10 Objects</option>
            <option value="20">20 Objects</option>
            <option value="30">30 Objects</option>
            <option value="50">50 Objects</option>
          </select>
        </div>

        {/* Model & Device Tag Info */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-content-secondary">
          <span>Device Acceleration:</span>
          <span className="font-mono font-bold text-brand-cyan uppercase px-1.5 py-0.5 rounded bg-brand-cyan/10">
            {device}
          </span>
        </div>
      </div>
    </div>
  );
};
