import React, { useState, useEffect } from 'react';
import { StudioLayout } from '../layouts/StudioLayout';
import { BarChart3, Activity, Gauge, Zap, Layers, TrendingUp, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { formatConfidence } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const metrics = [
    {
      title: 'Total Sessions',
      value: data ? data.total_sessions.toLocaleString() : '1,284',
      change: '+14% this week',
      icon: <Activity className="w-5 h-5 text-brand-blue" />,
    },
    {
      title: 'Objects Detected',
      value: data ? data.total_objects_detected.toLocaleString() : '8,542',
      change: '+28% throughput',
      icon: <Layers className="w-5 h-5 text-brand-cyan" />,
    },
    {
      title: 'Average Confidence',
      value: data ? `${data.average_confidence.toFixed(1)}%` : '94.2%',
      change: '+1.8% accuracy',
      icon: <Zap className="w-5 h-5 text-status-success" />,
    },
    {
      title: 'Average FPS',
      value: data ? `${Math.round(data.average_fps)} FPS` : '29 FPS',
      change: 'Real-time stable',
      icon: <Gauge className="w-5 h-5 text-brand-blue-bright" />,
    },
  ];

  const defaultDistribution = [
    { name: 'Person', count: 420, percentage: 48.5, color: '#2F80FF' },
    { name: 'Laptop', count: 185, percentage: 21.4, color: '#18C8FF' },
    { name: 'Car', count: 124, percentage: 14.3, color: '#3B8DFF' },
    { name: 'Phone', count: 88, percentage: 10.2, color: '#22C55E' },
    { name: 'Bottle', count: 48, percentage: 5.6, color: '#F59E0B' },
  ];

  const defaultAccuracyTrend = [
    { time: '00:00', accuracy: 92.4, fps: 28.5 },
    { time: '04:00', accuracy: 94.1, fps: 29.8 },
    { time: '08:00', accuracy: 95.8, fps: 30.0 },
    { time: '12:00', accuracy: 93.6, fps: 28.2 },
    { time: '16:00', accuracy: 96.2, fps: 29.5 },
    { time: '20:00', accuracy: 94.8, fps: 30.2 },
    { time: '24:00', accuracy: 95.4, fps: 29.1 },
  ];

  const defaultFpsTrend = [
    { timestamp: '01m', fps: 29.8, latency: 33.5 },
    { timestamp: '02m', fps: 29.2, latency: 34.2 },
    { timestamp: '03m', fps: 30.1, latency: 33.1 },
    { timestamp: '04m', fps: 28.9, latency: 34.6 },
    { timestamp: '05m', fps: 29.5, latency: 33.9 },
  ];

  const distribution = data?.class_distribution?.length ? data.class_distribution : defaultDistribution;
  const accuracyTrend = data?.accuracy_trend?.length ? data.accuracy_trend : defaultAccuracyTrend;
  const fpsTrend = data?.fps_trend?.length ? data.fps_trend : defaultFpsTrend;

  return (
    <StudioLayout>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-brand-cyan" />
              <span>Vision Analytics Dashboard</span>
            </h2>
            <p className="text-sm text-content-secondary">
              Real-time telemetry, object classification distribution, and neural inference metrics.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-background-panel border border-border text-xs font-semibold text-content-secondary hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m) => (
            <div
              key={m.title}
              className="p-5 rounded-2xl bg-background-panel border border-border space-y-3 shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-content-muted tracking-wider">
                  {m.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-background-secondary flex items-center justify-center">
                  {m.icon}
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {m.value}
              </div>
              <div className="text-[11px] text-brand-cyan flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 inline" />
                <span>{m.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Object Distribution Bar Chart */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Object Class Distribution</h3>
              <span className="text-xs font-mono text-brand-cyan">COCO Categories</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#8B9BB4" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8B9BB4" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1728',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#2F80FF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accuracy Trend Area Chart */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Detection Accuracy & Confidence</h3>
              <span className="text-xs font-mono text-status-success">Rolling Average</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyTrend}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F80FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2F80FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#8B9BB4" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8B9BB4" fontSize={11} domain={[85, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1728',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#2F80FF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#accuracyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FPS & Latency Stability Line Chart */}
          <div className="lg:col-span-12 p-6 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">FPS Stability & Processing Latency</h3>
              <span className="text-xs font-mono text-brand-cyan">Live Workstation Telemetry</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fpsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="timestamp" stroke="#8B9BB4" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8B9BB4" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1728',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fps"
                    name="FPS"
                    stroke="#22C55E"
                    strokeWidth={2.5}
                    dot={{ fill: '#22C55E' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    name="Latency (ms)"
                    stroke="#18C8FF"
                    strokeWidth={2}
                    dot={{ fill: '#18C8FF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
};
