import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StudioLayout } from '../layouts/StudioLayout';
import { Image, Eye, Trash2, Download, Calendar, Cpu, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { CapturedResult } from '../types';
import { formatConfidence, formatTimestamp } from '../utils/formatters';
import { toast } from '../hooks/useToast';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<CapturedResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await api.getResults(50, 0);
      setResults(data);
    } catch (err) {
      console.error('Failed to load results', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this detection snapshot?')) {
      return;
    }
    try {
      await api.deleteResult(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
      toast('success', 'Snapshot Deleted', 'Result removed from storage.');
    } catch (err: any) {
      toast('error', 'Delete Failed', err.message || 'Could not delete result.');
    }
  };

  const handleDownload = (e: React.MouseEvent, result: CapturedResult) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = result.image_path;
    link.download = `detection_${result.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('info', 'Downloading Snapshot', 'Image file saved.');
  };

  return (
    <StudioLayout>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Image className="w-6 h-6 text-brand-cyan" />
              <span>Detection Results Gallery</span>
            </h2>
            <p className="text-sm text-content-secondary">
              Review and export captured object detection snapshots with YOLO metadata.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchResults}
              className="p-2 rounded-xl bg-background-panel border border-border text-content-secondary hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/detector"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 shadow-glow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Capture New Frame</span>
            </Link>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
            <p className="text-xs text-content-secondary">Loading detection gallery...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-background-panel border border-dashed border-white/10 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-border flex items-center justify-center mx-auto">
              <Image className="w-8 h-8 text-content-muted" />
            </div>
            <h3 className="text-base font-bold text-white">No Detection Snapshots Yet</h3>
            <p className="text-xs text-content-secondary leading-relaxed">
              Launch the Object Detection Studio and click Capture to save annotated frames and analysis data.
            </p>
            <Link
              to="/detector"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-bright transition-all"
            >
              Go to Studio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => navigate(`/results/${result.id}`)}
                className="rounded-2xl bg-background-panel border border-border hover:border-brand-blue/40 transition-all shadow-card overflow-hidden group cursor-pointer flex flex-col justify-between"
              >
                {/* Image Preview Container */}
                <div className="relative aspect-video bg-black/50 overflow-hidden">
                  <img
                    src={result.thumbnail_path || result.image_path}
                    alt="Detection Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback placeholder if image path fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Object Count Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-background-panel/90 backdrop-blur-md border border-white/10 text-[11px] font-mono font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                    <span>{result.object_count} Objects</span>
                  </div>

                  {/* Confidence Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-brand-blue/90 backdrop-blur-md text-[11px] font-mono font-bold text-white">
                    {formatConfidence(result.average_confidence)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">
                      {result.detected_classes_summary || 'No classes detected'}
                    </h4>
                    <div className="flex items-center gap-4 text-[11px] text-content-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-content-muted" />
                        {formatTimestamp(result.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-brand-cyan" />
                        {result.model_used}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono text-content-muted">
                      {Math.round(result.processing_time_ms)}ms Latency
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDownload(e, result)}
                        className="p-1.5 rounded-lg text-content-secondary hover:text-white hover:bg-white/[0.05] transition-colors"
                        title="Download Image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, result.id)}
                        className="p-1.5 rounded-lg text-content-secondary hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="p-1.5 rounded-lg text-brand-cyan hover:bg-brand-cyan/10 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
};
