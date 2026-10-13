import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scan, Github, BookOpen, ArrowRight, QrCode, Video, BarChart3, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Object Detection', path: '/detector' },
    { name: 'Vision QR', path: '/qr' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Model Config', path: '/detector/model' },
    { name: 'Features', path: '/#features' },
    { name: 'Technology', path: '/#technology' },
  ];

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      const hash = path.substring(2);
      if (location.pathname === '/') {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-lg shadow-black/20'
          : 'bg-background/60 backdrop-blur-sm border-b border-white/[0.04]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-glow-sm group-hover:scale-105 transition-transform">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              VisionX <span className="text-brand-cyan text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20">AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-cyan bg-brand-cyan/10'
                    : 'text-content-secondary hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/detector/model"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-content-secondary hover:text-white hover:bg-white/[0.04] transition-colors border border-white/[0.06]"
          >
            <Cpu className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Config</span>
          </Link>

          <Link
            to="/qr"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-content-secondary hover:text-white hover:bg-white/[0.04] transition-colors border border-white/[0.06]"
          >
            <QrCode className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Vision QR</span>
          </Link>

          <Link
            to="/detector"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 transition-all shadow-glow-sm hover:shadow-glow-md active:scale-95"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
