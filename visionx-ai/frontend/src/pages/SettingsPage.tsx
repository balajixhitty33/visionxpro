import React, { useState, useEffect } from 'react';
import { StudioLayout } from '../layouts/StudioLayout';
import { Settings, Camera, Cpu, Sliders, Palette, Bell, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { UserSettings } from '../types';
import { toast } from '../hooks/useToast';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    camera_id: 'default',
    resolution_width: 1280,
    resolution_height: 720,
    target_fps: 30,
    model_name: 'YOLO11n',
    confidence_threshold: 0.25,
    iou_threshold: 0.45,
    max_detections: 30,
    device: 'auto',
    detection_overlay: true,
    show_labels: true,
    show_confidence: true,
    sound_notifications: false,
    theme: 'dark',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      toast('success', 'Preferences Saved', 'Workstation settings updated successfully.');
    } catch (err: any) {
      toast('error', 'Save Failed', err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudioLayout>
      <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-brand-cyan" />
            <span>Workstation Settings</span>
          </h2>
          <p className="text-sm text-content-secondary">
            Configure camera devices, bounding box rendering, audio alerts, and performance preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Camera & Resolution Section */}
          <div className="p-6 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-blue" />
              <span>Camera & Video Feed</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-content-secondary block">
                  Default Resolution
                </label>
                <select
                  value={`${settings.resolution_width}x${settings.resolution_height}`}
                  onChange={(e) => {
                    const [w, h] = e.target.value.split('x').map(Number);
                    setSettings({ ...settings, resolution_width: w, resolution_height: h });
                  }}
                  className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-2.5 outline-none focus:border-brand-blue font-mono"
                >
                  <option value="1280x720">1280 × 720 (720p HD Recommended)</option>
                  <option value="1920x1080">1920 × 1080 (1080p FHD)</option>
                  <option value="640x480">640 × 480 (480p SD)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-content-secondary block">
                  Target Camera FPS
                </label>
                <select
                  value={settings.target_fps}
                  onChange={(e) => setSettings({ ...settings, target_fps: parseInt(e.target.value, 10) })}
                  className="w-full bg-background-secondary border border-border text-white text-xs rounded-xl p-2.5 outline-none focus:border-brand-blue font-mono"
                >
                  <option value="30">30 FPS (Standard Smooth)</option>
                  <option value="60">60 FPS (Ultra High Refresh)</option>
                  <option value="15">15 FPS (Low Power Mode)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Detection & Rendering Preferences */}
          <div className="p-6 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-cyan" />
              <span>Overlay & Display Preferences</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-background-secondary border border-border cursor-pointer hover:border-white/20 transition-colors">
                <div>
                  <span className="text-xs font-bold text-white block">Canvas Bounding Box Overlay</span>
                  <span className="text-[11px] text-content-secondary">
                    Draw glowing bounding boxes and corner bracket brackets over video
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.detection_overlay}
                  onChange={(e) => setSettings({ ...settings, detection_overlay: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-brand-blue focus:ring-0 cursor-pointer accent-brand-blue"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-background-secondary border border-border cursor-pointer hover:border-white/20 transition-colors">
                <div>
                  <span className="text-xs font-bold text-white block">Display Class Labels</span>
                  <span className="text-[11px] text-content-secondary">
                    Show category name pills above detected bounding boxes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_labels}
                  onChange={(e) => setSettings({ ...settings, show_labels: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-brand-blue focus:ring-0 cursor-pointer accent-brand-blue"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-background-secondary border border-border cursor-pointer hover:border-white/20 transition-colors">
                <div>
                  <span className="text-xs font-bold text-white block">Display Confidence Percentage</span>
                  <span className="text-[11px] text-content-secondary">
                    Render numerical accuracy probability for every detected box
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_confidence}
                  onChange={(e) => setSettings({ ...settings, show_confidence: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-brand-blue focus:ring-0 cursor-pointer accent-brand-blue"
                />
              </label>
            </div>
          </div>

          {/* Sound & Notifications */}
          <div className="p-6 rounded-2xl bg-background-panel border border-border space-y-4 shadow-card">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-status-warning" />
              <span>Audio & System Alerts</span>
            </h3>

            <label className="flex items-center justify-between p-3 rounded-xl bg-background-secondary border border-border cursor-pointer hover:border-white/20 transition-colors">
              <div>
                <span className="text-xs font-bold text-white block">Sound on Capture</span>
                <span className="text-[11px] text-content-secondary">
                  Play subtle audio feedback when saving detection snapshots
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.sound_notifications}
                onChange={(e) => setSettings({ ...settings, sound_notifications: e.target.checked })}
                className="w-4 h-4 rounded border-border text-brand-blue focus:ring-0 cursor-pointer accent-brand-blue"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 shadow-glow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Workstation Settings</span>
            </button>
          </div>
        </form>
      </div>
    </StudioLayout>
  );
};
