import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StudioLayout } from '../layouts/StudioLayout';
import { ArrowLeft, Download, Trash2, Calendar, Cpu, Layers, Eye, Code, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { CapturedResult } from '../types';
import { getObjectColor, hexToRgba } from '../utils/colors';
import { formatConfidence, formatTimestamp } from '../utils/formatters';
import { toast } from '../hooks/useToast';

export const ResultDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<CapturedResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getResultById(id);
        setResult(data);
      } catch (err: any) {
        toast('error', 'Not Found', 'Could not load detection snapshot.');
        navigate('/results');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  // Draw overlay bounding boxes
  const drawBoxes = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !result) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = img.naturalWidth || img.clientWidth;
    const height = img.naturalHeight || img.clientHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (!showBoxes) return;

    result.objects.forEach((box, idx) => {
      const isSelected = selectedBoxIndex === idx;
      const x = box.norm_x !== undefined && box.norm_x !== null ? box.norm_x * width : box.x;
      const y = box.norm_y !== undefined && box.norm_y !== null ? box.norm_y * height : box.y;
      const w = box.norm_width !== undefined && box.norm_width !== null ? box.norm_width * width : box.width;
      const h = box.norm_height !== undefined && box.norm_height !== null ? box.norm_height * height : box.height;

      const color = getObjectColor(box.class_name);
      const confPct = Math.round((box.confidence <= 1.0 ? box.confidence * 100 : box.confidence));
      const label = `${box.class_name.toUpperCase()} ${confPct}%`;

      // Bounding box border
      ctx.shadowColor = color;
      ctx.shadowBlur = isSelected ? 18 : 8;
      ctx.strokeStyle = isSelected ? '#FFFFFF' : color;
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;

      // Subtle fill
      ctx.fillStyle = hexToRgba(color, isSelected ? 0.2 : 0.08);
      ctx.fillRect(x, y, w, h);

      // Label background
      ctx.font = 'bold 13px "JetBrains Mono", Inter, monospace';
      const textMetrics = ctx.measureText(label);
      const badgeWidth = textMetrics.width + 16;
      const badgeHeight = 24;
      const badgeY = Math.max(0, y - badgeHeight);

      ctx.fillStyle = isSelected ? '#FFFFFF' : color;
      ctx.beginPath();
      ctx.roundRect(x, badgeY, badgeWidth, badgeHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Label text
      ctx.fillStyle = isSelected ? '#000000' : '#FFFFFF';
      ctx.fillText(label, x + 8, badgeY + 16);
    });
  };

  useEffect(() => {
    drawBoxes();
  }, [result, showBoxes, selectedBoxIndex]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this snapshot permanently?')) return;
    try {
      await api.deleteResult(id);
      toast('success', 'Deleted', 'Snapshot removed.');
      navigate('/results');
    } catch (err: any) {
      toast('error', 'Delete Failed', err.message);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.image_path;
    link.download = `detection_${result.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('info', 'Downloading Snapshot');
  };

  const handleExportJSON = () => {
    if (!result) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `detection_${result.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('info', 'Exported JSON metadata');
  };

  return (
    <StudioLayout>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation & Actions Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/results"
            className="flex items-center gap-2 text-xs font-semibold text-content-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Results Gallery</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                showBoxes
                  ? 'bg-brand-blue/15 border-brand-blue text-brand-cyan'
                  : 'bg-background-panel border-border text-content-secondary'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-background-panel border border-border text-content-secondary hover:text-white transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-bright transition-all shadow-glow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-content-secondary hover:text-status-danger hover:bg-status-danger/10 border border-border transition-colors"
              title="Delete Snapshot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
            <p className="text-xs text-content-secondary">Loading snapshot details...</p>
          </div>
        ) : !result ? (
          <div className="p-8 text-center text-xs text-content-muted">Result not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Annotated Large Image */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-background-secondary border border-border shadow-2xl flex items-center justify-center">
                <img
                  ref={imgRef}
                  src={result.image_path}
                  alt="Captured Frame"
                  onLoad={drawBoxes}
                  className="w-full h-auto object-contain max-h-[650px]"
                />

                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </div>

              {/* Snapshot Metadata Bar */}
              <div className="p-4 rounded-xl bg-background-panel border border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-content-muted block text-[10px]">OBJECTS DETECTED</span>
                  <span className="font-mono font-bold text-white text-base">
                    {result.object_count}
                  </span>
                </div>
                <div>
                  <span className="text-content-muted block text-[10px]">AVERAGE CONFIDENCE</span>
                  <span className="font-mono font-bold text-brand-cyan text-base">
                    {formatConfidence(result.average_confidence)}
                  </span>
                </div>
                <div>
                  <span className="text-content-muted block text-[10px]">INFERENCE TIME</span>
                  <span className="font-mono font-bold text-status-success text-base">
                    {Math.round(result.processing_time_ms)}ms
                  </span>
                </div>
                <div>
                  <span className="text-content-muted block text-[10px]">MODEL ARCHITECTURE</span>
                  <span className="font-mono font-bold text-white text-base">
                    {result.model_used}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Object Class Breakdown List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white tracking-tight">Detected Objects</h3>
                  <span className="text-xs font-mono text-brand-cyan font-semibold">
                    {result.objects.length} Instances
                  </span>
                </div>

                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {result.objects.map((box, idx) => {
                    const isSelected = selectedBoxIndex === idx;
                    const color = getObjectColor(box.class_name);
                    return (
                      <div
                        key={`${box.class_name}-${idx}`}
                        onClick={() => setSelectedBoxIndex(isSelected ? null : idx)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-brand-blue/15 border-brand-blue shadow-glow-sm'
                            : 'bg-background-secondary border-border hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-bold text-white capitalize">
                              {box.class_name}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-brand-cyan">
                            {formatConfidence(box.confidence)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-content-muted font-mono">
                          <span>
                            X: {Math.round(box.x)}, Y: {Math.round(box.y)}
                          </span>
                          <span>
                            {Math.round(box.width)} × {Math.round(box.height)} px
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudioLayout>
  );
};
