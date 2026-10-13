import React, { useState, useEffect } from 'react';
import { StudioLayout } from '../layouts/StudioLayout';
import { History, Download, Trash2, Calendar, Clock, Activity, Cpu, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';
import { SessionRecord } from '../types';
import { formatConfidence, formatDuration, formatTimestamp } from '../utils/formatters';
import { toast } from '../hooks/useToast';

export const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this session log?')) return;
    try {
      await api.deleteHistorySession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast('success', 'Session Deleted', 'History record removed.');
    } catch (err: any) {
      toast('error', 'Delete Failed', err.message);
    }
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const headers = ['Session', 'Date', 'Duration', 'Frames', 'Avg FPS', 'Avg Latency (ms)', 'Accuracy', 'Classes', 'Status', 'Model'];
    const rows = sessions.map((s) => [
      `Session #${s.session_number}`,
      s.started_at,
      formatDuration(s.duration_seconds),
      s.total_frames,
      s.avg_fps,
      s.avg_latency,
      `${(s.avg_confidence * 100).toFixed(1)}%`,
      `"${s.detected_classes}"`,
      s.status,
      s.model_used,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visionx_session_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('info', 'Export Complete', 'CSV history downloaded.');
  };

  return (
    <StudioLayout>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <History className="w-6 h-6 text-brand-cyan" />
              <span>Detection Session History</span>
            </h2>
            <p className="text-sm text-content-secondary">
              Logs of past computer vision sessions, frame throughput, and detected class taxonomy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchHistory}
              className="p-2 rounded-xl bg-background-panel border border-border text-content-secondary hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-background-panel hover:bg-background-card border border-border transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-cyan" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-2xl bg-background-panel border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background-secondary border-b border-border text-content-muted uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Session</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Detected Classes</th>
                  <th className="px-5 py-3.5">Accuracy</th>
                  <th className="px-5 py-3.5">Avg FPS</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-content-secondary font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-content-muted">
                      <RefreshCw className="w-6 h-6 text-brand-cyan animate-spin mx-auto mb-2" />
                      Loading history records...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-content-muted">
                      No detection sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-bold text-white">
                        Session #{s.session_number}
                        <span className="block text-[10px] text-content-muted font-normal font-sans">
                          {s.model_used}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-sans text-white">
                        {formatTimestamp(s.started_at)}
                      </td>
                      <td className="px-5 py-4 font-sans text-white max-w-[200px] truncate">
                        {s.detected_classes || 'None'}
                      </td>
                      <td className="px-5 py-4 text-brand-cyan font-bold">
                        {formatConfidence(s.avg_confidence)}
                      </td>
                      <td className="px-5 py-4 text-status-success font-bold">
                        {Math.round(s.avg_fps)} FPS
                      </td>
                      <td className="px-5 py-4 text-white">
                        {formatDuration(s.duration_seconds)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-success/15 text-status-success border border-status-success/30">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg text-content-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
};
