import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  RefreshCw,
  Menu,
  X,
  History,
  Calendar,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { SmoothThemeToggle } from '../ui/SmoothThemeToggle';
import { LanguageSelector } from './LanguageSelector';

interface AppNavbarProps {
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenHistorical?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onManualRefresh,
  isRefreshing = false,
  onOpenHistorical,
}) => {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [istDateStr, setIstDateStr] = useState('');

  // Live IST Date & Time
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const str = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);
        setIstDateStr(str);
      } catch {
        setIstDateStr('Monsoon 2026');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: '/', label: 'Overview' },
    { to: '/stations', label: t.navStations },
    { to: '/basins', label: t.navBasins },
    { to: '/bulletins', label: t.navBulletins },
    { to: '/disasters', label: t.navDisasters },
    { to: '/watchlist', label: 'Watchlist' },
    { to: '/report-incident', label: 'Ground Report' },
    { to: '/contact', label: 'Contact & SOS' },
    { to: '/help', label: t.navHelp },
  ];

  return (
    <header className="w-full bg-white/80 dark:bg-[#0E101B]/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 transition-colors">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Modern Zentra-style Logo & Wordmark */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 select-none group shrink-0"
        >
          {/* Sleek geometric gradient icon badge */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center shadow-xs shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-[3px] rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-sans">
            flowshield
          </span>
        </NavLink>

        {/* Center: Sleek Floating Pill Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-900/60 p-1 rounded-full border border-slate-200/60 dark:border-slate-800/60">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none ${
                  isActive
                    ? 'bg-[#151722] dark:bg-white text-white dark:text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Controls: Telemetry Date Pill, Sync, Language, Single Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Dribbble Style Date Range / Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{istDateStr} • CWC Stream</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* 3-Minute Refresh Button */}
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Auto-refreshes every 3 minutes. Click to refresh telemetry now."
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[11px]">Sync</span>
          </button>

          {/* Language Selector (10 River Basin Languages) */}
          <LanguageSelector />

          {/* Single Smooth Animated Theme Capsule Switcher */}
          <SmoothThemeToggle size="sm" />

          {/* Historical Disaster Intel Trigger */}
          {onOpenHistorical && (
            <button
              type="button"
              onClick={onOpenHistorical}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Open Historical Disaster Intelligence"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Intel</span>
            </button>
          )}

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E101B] px-4 py-3 flex flex-col gap-1.5 shadow-lg">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-[#151722] dark:bg-white text-white dark:text-slate-950 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {/* Mobile Language Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Language</span>
            <LanguageSelector isMobile={true} />
          </div>

          {/* Mobile Theme Toggle Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme</span>
            <SmoothThemeToggle size="sm" />
          </div>
        </div>
      )}
    </header>
  );
};

export default AppNavbar;
