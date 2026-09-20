import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  RefreshCw,
  Menu,
  X,
  History,
  Calendar,
  Waves,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { SmoothThemeToggle } from '../ui/SmoothThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { LeftFeatureDrawer } from './LeftFeatureDrawer';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [istDateStr, setIstDateStr] = useState('Today');

  // Live IST Date
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const str = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
        }).format(now);
        setIstDateStr(str);
      } catch {
        setIstDateStr('Live');
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
    <>
      <header className="w-full bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Top-Left Menu Button + Modern Logo & Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Three Line Button (Menu) on Top Left */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--surface)] text-[var(--text)] font-bold text-xs border border-[var(--border)] shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
              title="Open all features and options (Menu)"
              aria-label="Open left feature navigation drawer"
            >
              <Menu className="w-4 h-4 text-[var(--live)]" />
              <span className="font-bold text-xs tracking-wide">Menu</span>
            </button>

            <NavLink
              to="/"
              className="flex items-center gap-2.5 select-none shrink-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-xs group-hover:brightness-110 transition-all">
                <Waves className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[var(--text)] leading-none">
                  FlowShield
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide mt-0.5">
                  CWC Flood Telemetry
                </span>
              </div>
            </NavLink>
          </div>

          {/* Center: Clean Pill Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)]">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium transition-all select-none ${
                    isActive
                      ? 'bg-[var(--primary)] text-white font-bold shadow-2xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls: Telemetry Date Pill, Sync, Language, Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Telemetry Stream Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] font-medium">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{istDateStr} • CWC Stream</span>
              <span className="w-2 h-2 rounded-full bg-[var(--live)] animate-pulse" />
            </div>

            {/* 3-Minute Refresh Button */}
            <button
              type="button"
              onClick={onManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-semibold border border-[var(--border)] transition-colors cursor-pointer"
              title="Auto-refreshes every 3 minutes. Click to refresh telemetry now."
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--live)] ${isRefreshing ? 'animate-spin' : ''}`} />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--surface)] text-[var(--live)] border border-[var(--border)] text-xs font-semibold transition-colors cursor-pointer"
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

      {/* Left Feature & Options Navigation Drawer (triggered by top-left 3-line button) */}
      <LeftFeatureDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onManualRefresh={onManualRefresh}
        isRefreshing={isRefreshing}
        onOpenHistorical={onOpenHistorical}
        istTimeStr={istDateStr}
      />
    </>
  );
};

export default AppNavbar;
