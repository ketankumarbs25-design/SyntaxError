import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Waves,
  RefreshCw,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { useTheme } from '../../hooks/useTheme';

interface AppNavbarProps {
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onManualRefresh,
  isRefreshing = false,
}) => {
  const { language, setLanguage, t } = useI18n();
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [istTimeStr, setIstTimeStr] = useState('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const str = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
        setIstTimeStr(`${str} IST`);
      } catch {
        setIstTimeStr('IST');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: '/', label: t.navHome },
    { to: '/stations', label: t.navStations },
    { to: '/basins', label: t.navBasins },
    { to: '/bulletins', label: t.navBulletins },
    { to: '/help', label: t.navHelp },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0E101B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: FlowShield India Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-3 select-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                {t.appTitle}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
              {t.nationalIntelligence}
            </p>
          </div>
        </NavLink>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Controls: IST Clock, Auto-Refresh Status, Language Toggle, Theme Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Live IST clock badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200/70 dark:border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{istTimeStr}</span>
          </div>

          {/* 3-Minute Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Auto-refreshes every 3 minutes. Click to refresh telemetry now."
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[11px]">3m Sync</span>
          </button>

          {/* Language Switcher (EN / हिन्दी) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900/50 transition-colors cursor-pointer"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E101B] px-4 py-3 flex flex-col gap-1.5 shadow-lg">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{istTimeStr}</span>
            <span>Refreshes every 3 min</span>
          </div>
        </div>
      )}
    </header>
  );
};
