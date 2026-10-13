import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DetectorPage } from './pages/DetectorPage';
import { VisionQRPage } from './pages/VisionQRPage';
import { ModelConfigPage } from './pages/ModelConfigPage';
import { ResultsPage } from './pages/ResultsPage';
import { ResultDetailPage } from './pages/ResultDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useToastState } from './hooks/useToast';
import { ToastContainer } from './components/common/ToastContainer';

export const App: React.FC = () => {
  const { toasts, removeToast } = useToastState();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-content-primary flex flex-col font-sans">
        <Routes>
          {/* PRIMARY ENTRY POINT: Main Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* MAIN MODULE 1: Live Object Detection Studio */}
          <Route path="/detector" element={<DetectorPage />} />

          {/* MAIN MODULE 2: Vision QR Code Studio */}
          <Route path="/qr" element={<VisionQRPage />} />
          <Route path="/vision-qr" element={<VisionQRPage />} />

          {/* MAIN MODULE 3: Live Telemetry & Analytics Dashboard */}
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* MAIN MODULE 4: YOLO Model Configuration & Hardware Settings */}
          <Route path="/detector/model" element={<ModelConfigPage />} />
          <Route path="/models" element={<ModelConfigPage />} />

          {/* Additional Features & Studio Subsections */}
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/results/:id" element={<ResultDetailPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Backwards-Compatibility Redirects */}
          <Route path="/svg" element={<Navigate to="/" replace />} />
          <Route path="/detectorsvg" element={<Navigate to="/detector" replace />} />
          <Route path="/qrsvg" element={<Navigate to="/qr" replace />} />
          <Route path="/analyticssvg" element={<Navigate to="/analytics" replace />} />
          <Route path="/detector/modelsvg" element={<Navigate to="/detector/model" replace />} />
          <Route path="/modelsvg" element={<Navigate to="/detector/model" replace />} />
          <Route path="/resultssvg" element={<Navigate to="/results" replace />} />
          <Route path="/historysvg" element={<Navigate to="/history" replace />} />
          <Route path="/settingssvg" element={<Navigate to="/settings" replace />} />

          {/* Global Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Alerts */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </BrowserRouter>
  );
};

export default App;
