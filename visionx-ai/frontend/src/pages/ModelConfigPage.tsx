import React, { useState, useEffect } from 'react';
import { StudioLayout } from '../layouts/StudioLayout';
import { Cpu, Check, Sliders, Zap, Shield, HardDrive, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ModelInfo, UserSettings } from '../types';
import { toast } from '../hooks/useToast';

export const ModelConfigPage: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('yolo11n.pt');
  const [device, setDevice] = useState<string>('auto');
  const [confidence, setConfidence] = useState<number>(0.25);
  const [iou, setIou] = useState<number>(0.45);
  const [maxDetections, setMaxDetections] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsRes, settingsRes] = await Promise.all([
          api.getModels(),
          api.getSettings(),
        ]);
        if (modelsRes.available_models) {
          setModels(modelsRes.available_models);
          setSelectedModel(modelsRes.current_model || 'yolo11n.pt');
        }
        if (settingsRes) {
          setDevice(settingsRes.device || 'auto');
          setConfidence(settingsRes.confidence_threshold || 0.25);
          setIou(settingsRes.iou_threshold || 0.45);
          setMaxDetections(settingsRes.max_detections || 30);
        }
      } catch (err) {
        console.error('Failed to load model configurations', err);
      }
    };
    fetchData();
  }, []);

  const handleApply = async () => {
    setLoading(true);
    try {
      // 1. Switch active model engine
      await api.loadModel(selectedModel, device);
      // 2. Save settings
      await api.updateSettings({
        model_name: selectedModel,
        device,
        confidence_threshold: confidence,
        iou_threshold: iou,
        max_detections: maxDetections,
      });
      toast('success', 'Configuration Applied', `Active Model: ${selectedModel} on ${device.toUpperCase()}`);
    } catch (err: any) {
      toast('error', 'Configuration Failed', err.message || 'Could not update model settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudioLayout>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-brand-cyan" />
            <span>Model Configuration</span>
          </h2>
          <p className="text-sm text-content-secondary">
            Manage neural architecture weights, edge acceleration, and inference thresholds.
          </p>
        </div>

        {/* Model Selection Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-content-muted tracking-wider">
            Available YOLO Architectures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-blue/15 border-brand-blue shadow-glow-sm'
                      : 'bg-background-panel border-border hover:border-white/20'
                  }`}
                >
                  {model.recommended && (
                    <div className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                      RECOMMENDED
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-blue bg-brand-blue text-white' : 'border-white/30'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <h4 className="text-base font-bold text-white">{model.name}</h4>
                    </div>

                    <p className="text-xs text-content-secondary leading-relaxed">
                      {model.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
                      <div>
                        <span className="text-content-muted block text-[10px]">PARAMS</span>
                        <span className="font-semibold text-white">{model.parameters}</span>
                      </div>
                      <div>
                        <span className="text-content-muted block text-[10px]">WEIGHT SIZE</span>
                        <span className="font-semibold text-white">{model.size_mb} MB</span>
                      </div>
                      <div>
                        <span className="text-content-muted block text-[10px]">PRECISION</span>
                        <span className="font-semibold text-brand-cyan">{model.mAP}</span>
                      </div>
                      <div>
                        <span className="text-content-muted block text-[10px]">SPEED</span>
                        <span className="font-semibold text-status-success">{model.speed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inference Parameters */}
        <div className="p-6 rounded-2xl bg-background-panel border border-border space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-blue" />
            <span>Inference Hyperparameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confidence Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-content-secondary">Confidence Threshold</span>
                <span className="font-mono font-bold text-brand-cyan">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full h-2 bg-background-secondary rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <p className="text-[11px] text-content-muted">
                Minimum prediction probability score required to display a detection box.
              </p>
            </div>

            {/* IoU Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-content-secondary">IoU NMS Threshold</span>
                <span className="font-mono font-bold text-brand-cyan">
                  {Math.round(iou * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={iou}
                onChange={(e) => setIou(parseFloat(e.target.value))}
                className="w-full h-2 bg-background-secondary rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <p className="text-[11px] text-content-muted">
                Non-Maximum Suppression overlap threshold for eliminating redundant boxes.
              </p>
            </div>

            {/* Max Detections */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-content-secondary block">
                Maximum Detections Per Frame
              </label>
              <select
                value={maxDetections}
                onChange={(e) => setMaxDetections(parseInt(e.target.value, 10))}
                className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-2.5 outline-none focus:border-brand-blue font-mono"
              >
                <option value="10">10 Detections</option>
                <option value="20">20 Detections</option>
                <option value="30">30 Detections</option>
                <option value="50">50 Detections</option>
                <option value="100">100 Detections</option>
              </select>
            </div>

            {/* Hardware Device */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-content-secondary block">
                Hardware Device Target
              </label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-2.5 outline-none focus:border-brand-blue font-mono"
              >
                <option value="auto">Auto (Best Available Accelerator)</option>
                <option value="cpu">CPU (Standard Thread Pool)</option>
                <option value="cuda">NVIDIA GPU (CUDA)</option>
                <option value="mps">Apple Silicon (MPS)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleApply}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 shadow-glow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Apply Configuration</span>
          </button>
        </div>
      </div>
    </StudioLayout>
  );
};
