import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Scan,
  QrCode,
  LayoutDashboard,
  Video,
  Cpu,
  Image,
  BarChart3,
  History,
  Settings,
  Bell,
  User,
  ExternalLink,
  HelpCircle,
  Menu,
  X,
  Radio,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  children: React.ReactNode;
}

export const StudioLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{ online: boolean; device: string; model: string }>({
    online: true,
    device: 'cpu',
    model: 'YOLO11n',
  });

  // Check health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await api.getHealth();
        setSystemStatus({
          online: health.status === 'online',
          device: health.device || 'cpu',
          model: health.current_model || 'YOLO11n',
        });
      } catch {
        setSystemStatus((prev) => ({ ...prev, online: false }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Live Detection', path: '/detector', icon: <Video className="w-4 h-4" /> },
    { name: 'Vision QR', path: '/qr', icon: <QrCode className="w-4 h-4 text-brand-cyan" /> },
    { name: 'Model Config', path: '/detector/model', icon: <Cpu className="w-4 h-4" /> },
    { name: 'Results', path: '/results', icon: <Image className="w-4 h-4" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'History', path: '/history', icon: <History className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-content-primary flex flex-col selection:bg-brand-blue selection:text-white">
      {/* TOP HEADER */}
      <header className="h-16 bg-background-panel border-b border-border flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
        {/* Left Branding & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-content-secondary hover:text-white hover:bg-white/[0.05]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-glow-sm">
              <Scan className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">VisionX AI</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-brand-blue/20 text-brand-cyan border border-brand-blue/30">
                  {systemStatus.model}
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden sm:block h-5 w-[1px] bg-white/10 mx-1" />

          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-semibold text-white leading-tight">Object Detection Studio</h1>
            <p className="text-[11px] text-content-secondary leading-tight">
              Real-time computer vision analysis
            </p>
          </div>
        </div>

        {/* Right System Indicators & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-background-secondary border border-border text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                systemStatus.online ? 'bg-status-success shadow-[0_0_8px_#22c55e]' : 'bg-status-danger'
              } animate-pulse`}
            />
            <span className="text-[11px] font-medium text-content-secondary hidden sm:inline">
              {systemStatus.online ? 'System Online' : 'System Offline'}
            </span>
            <span className="text-[10px] text-brand-cyan font-semibold uppercase px-1 rounded bg-brand-cyan/10">
              {systemStatus.device}
            </span>
          </div>

          <Link
            to="/settings"
            className="p-2 rounded-lg text-content-secondary hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <div className="w-8 h-8 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-cyan text-xs font-bold font-mono">
            VX
          </div>
        </div>
      </header>

      {/* BODY (SIDEBAR + CONTENT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Desktop 220-240px) */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-20 w-60 bg-background-secondary border-r border-border flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Nav Links */}
          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">
              Workstation Menu
            </div>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-glow-sm font-semibold'
                      : 'text-content-secondary hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-content-secondary'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Sidebar Info */}
          <div className="p-4 border-t border-white/[0.06] space-y-2 text-[11px] text-content-secondary">
            <a
              href="#docs"
              onClick={(e) => {
                e.preventDefault();
                navigate('/detector/model');
              }}
              className="flex items-center justify-between hover:text-brand-cyan transition-colors"
            >
              <span>Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex items-center justify-between">
              <span className="text-content-muted">Version</span>
              <span className="font-mono font-semibold text-brand-cyan">v1.0.0</span>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE AREA */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-background min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
