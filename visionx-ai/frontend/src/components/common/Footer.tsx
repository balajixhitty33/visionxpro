import React from 'react';
import { Link } from 'react-router-dom';
import { Scan, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-background-secondary border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-glow-sm">
                <Scan className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">VisionX AI</span>
            </Link>
            <p className="text-xs font-mono font-semibold text-brand-cyan uppercase tracking-wider">
              See. Detect. Understand.
            </p>
            <p className="text-xs text-content-secondary leading-relaxed">
              Real-time AI-powered computer vision & edge object detection workstation.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li>
                <Link to="/detector" className="hover:text-brand-cyan transition-colors">
                  Object Detection Studio
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-brand-cyan transition-colors">
                  Live Analytics
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-brand-cyan transition-colors">
                  Detection Results
                </Link>
              </li>
              <li>
                <Link to="/detector/model" className="hover:text-brand-cyan transition-colors">
                  Model Configurations
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li>
                <a href="#technology" className="hover:text-brand-cyan transition-colors">
                  Documentation & Architecture
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-brand-cyan transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-brand-cyan transition-colors">
                  API Status
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-cyan transition-colors">
                  Model Zoo Benchmark
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-content-secondary">
              <li>
                <Link to="/settings" className="hover:text-brand-cyan transition-colors">
                  Workstation Preferences
                </Link>
              </li>
              <li>
                <span className="text-content-muted">Release: v1.0.0 Stable</span>
              </li>
              <li>
                <span className="text-content-muted">Ultralytics YOLO11n Core</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
          <p>© 2026 VisionX AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-status-danger fill-status-danger inline" /> for Computer Vision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
