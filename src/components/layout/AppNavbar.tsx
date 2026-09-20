import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Calendar,
  Waves,
  ChevronDown,
  PhoneCall,
  FileText,
  HelpCircle,
  History,
  Home,
  Radio,
  Bell,
  MoreHorizontal,
  X,
  Eye,
  AlertTriangle,
  Globe,
  Bot,
  Zap,
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
  const location = useLocation();
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [istDateStr, setIstDateStr] = useState('Today');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close desktop dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sheet on route change
  useEffect(() => {
    setMobileSheetOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  // Primary links on desktop (5-6 links)
  const primaryLinks = [
    { to: '/', label: 'Overview' },
    { to: '/stations', label: t.navStations },
    { to: '/basins', label: t.navBasins },
    { to: '/simulate', label: '⚡ Simulate' },
    { to: '/bulletins', label: t.navBulletins },
    { to: '/disasters', label: t.navDisasters },
    { to: '/watchlist', label: 'Watchlist' },
  ];

  // Mobile bottom tab bar items (5 items)
  const mobileTabItems = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/stations', label: 'Stations', icon: Radio },
    { to: '/simulate', label: 'Simulate', icon: Zap },
    { to: '/basins', label: 'Basins', icon: Waves },
    { to: '/bulletins', label: 'Bulletins', icon: Bell },
  ];

  const isMoreActive = ['/report-incident', '/contact', '/help'].includes(location.pathname);

  return (
    <>
      {/* ─── Slim Sticky Top Bar ────────────────────────────────────────── */}
      <header className="w-full bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo & Wordmark */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 select-none shrink-0 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs group-hover:brightness-110 transition-all">
              <Waves className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-[var(--text)] leading-none">
                FlowShield India
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-normal tracking-normal mt-0.5">
                CWC flood telemetry
              </span>
            </div>
          </NavLink>

          {/* Center: Desktop Navigation with Animated Sliding Pill Highlight */}
          <nav className="hidden lg:flex items-center gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] relative">
            {primaryLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors select-none ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-[var(--primary)] rounded-lg -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </NavLink>
              );
            })}

            {/* Desktop "More" Dropdown Trigger */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                  isMoreActive
                    ? 'text-[var(--text)] font-semibold bg-[var(--surface-2)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    moreDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Desktop "More" Dropdown Menu */}
              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-1.5 z-50 flex flex-col gap-0.5"
                  >
                    <NavLink
                      to="/report-incident"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>Ground report</span>
                    </NavLink>

                    <NavLink
                      to="/contact"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 text-[var(--danger)]" />
                      <span>Contact & SOS</span>
                    </NavLink>

                    <NavLink
                      to="/help"
                      onClick={() => setMoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[var(--text-muted)]" />
                      <span>Help & data</span>
                    </NavLink>

                    {onOpenHistorical && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreDropdownOpen(false);
                          onOpenHistorical();
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors text-left w-full cursor-pointer"
                      >
                        <History className="w-4 h-4 text-[var(--live)]" />
                        <span>Disaster intel</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Group: Live Status Chip, Language, Theme, Sync (Icon-Only), Permanent Red SOS */}
          <div className="flex items-center gap-2 shrink-0">
            {/* AI Assistant & Command Navigator Trigger (Ctrl+K / ⌘K) */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('fs-open-chatbot'));
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text)] hover:text-[var(--live)] border border-[var(--border)] text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
              title="Open FlowShield AI Navigator (Ctrl+K / ⌘K)"
              aria-label="Open AI Assistant & Command Navigator"
            >
              <Bot className="w-3.5 h-3.5 text-[var(--live)]" />
              <span className="hidden sm:inline">AI Nav</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] leading-none">
                ⌘K
              </kbd>
            </button>

            {/* 3D Satellite Earth Globe Trigger */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('fs-replay-intro'));
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--live)] border border-[var(--border)] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="View 3D Satellite Earth Globe"
              aria-label="3D Satellite Earth Globe"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--live)] animate-spin [animation-duration:18s]" />
              <span className="hidden md:inline">3D Globe</span>
            </button>

            {/* Live Status Chip */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{istDateStr} · Live</span>
              <span className="w-2 h-2 rounded-full bg-[var(--live)] animate-pulse" />
            </div>

            {/* Permanent Red Icon Button for Contact & SOS */}
            <NavLink
              to="/contact"
              className="p-2 rounded-lg bg-[var(--danger)] text-white hover:brightness-110 active:scale-95 transition-all shadow-xs shrink-0 flex items-center justify-center"
              title="Emergency Contact & SOS"
              aria-label="Emergency Contact & SOS"
            >
              <PhoneCall className="w-4 h-4" />
            </NavLink>

            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Theme Toggle */}
            <SmoothThemeToggle size="sm" />

            {/* Sync Button: Icon-Only with Tooltip */}
            <button
              type="button"
              onClick={onManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] transition-colors cursor-pointer shrink-0"
              title="Auto-refreshes every 3 minutes. Click to sync telemetry now."
              aria-label="Sync telemetry data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--live)] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Bottom Tab Bar (Below 1024px) ────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] px-2 py-1 flex items-center justify-around shadow-lg"
        aria-label="Mobile navigation"
      >
        {mobileTabItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-[var(--live)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* 5th Item: More Button (Opens Mobile Slide-Up Sheet) */}
        <button
          type="button"
          onClick={() => setMobileSheetOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
            isMoreActive || mobileSheetOpen
              ? 'text-[var(--live)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
          aria-label="More navigation and tools"
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* ─── Mobile Slide-Up Sheet (Spring/Ease Backdrop & Sheet) ───────── */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileSheetOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />

            {/* Slide-Up Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto flex flex-col gap-4 shadow-2xl pb-8"
            >
              {/* Drag Handle Indicator & Header */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
                <div className="w-full flex items-center justify-between pt-1">
                  <span className="font-semibold text-sm text-[var(--text)]">Navigation & tools</span>
                  <button
                    type="button"
                    onClick={() => setMobileSheetOpen(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                    aria-label="Close sheet"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Extra Navigation Routes */}
              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to="/watchlist"
                  onClick={() => setMobileSheetOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                    location.pathname === '/watchlist'
                      ? 'bg-[var(--primary)] text-white border-transparent'
                      : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]'
                  }`}
                >
                  <Eye className="w-4 h-4 text-[var(--live)]" />
                  <span>Watchlist</span>
                </NavLink>

                <NavLink
                  to="/disasters"
                  onClick={() => setMobileSheetOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                    location.pathname === '/disasters'
                      ? 'bg-[var(--primary)] text-white border-transparent'
                      : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                  <span>Disasters</span>
                </NavLink>

                <NavLink
                  to="/report-incident"
                  onClick={() => setMobileSheetOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                    location.pathname === '/report-incident'
                      ? 'bg-[var(--primary)] text-white border-transparent'
                      : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Ground report</span>
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setMobileSheetOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-colors ${
                    location.pathname === '/contact'
                      ? 'bg-[var(--danger)] text-white border-transparent'
                      : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 text-[var(--danger)]" />
                  <span>Contact & SOS</span>
                </NavLink>

                <NavLink
                  to="/help"
                  onClick={() => setMobileSheetOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-colors col-span-2 ${
                    location.pathname === '/help'
                      ? 'bg-[var(--primary)] text-white border-transparent'
                      : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Help & data</span>
                </NavLink>

                {onOpenHistorical && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileSheetOpen(false);
                      onOpenHistorical();
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] text-xs font-medium text-left cursor-pointer"
                  >
                    <History className="w-4 h-4 text-[var(--live)]" />
                    <span>Disaster intel</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileSheetOpen(false);
                    window.dispatchEvent(new CustomEvent('fs-replay-intro'));
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] text-[var(--live)] border border-[var(--border)] text-xs font-medium text-left cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[var(--live)] animate-spin [animation-duration:18s]" />
                  <span>3D Satellite Earth</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileSheetOpen(false);
                    window.dispatchEvent(new CustomEvent('fs-open-chatbot'));
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--surface-2)] text-[var(--text)] hover:text-[var(--live)] border border-[var(--border)] text-xs font-medium text-left cursor-pointer col-span-2"
                >
                  <Bot className="w-4 h-4 text-[var(--live)]" />
                  <span>AI Navigator & Command Palette (Ctrl+K)</span>
                </button>
              </div>

              {/* Controls Bar: Language Selector & Theme */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--text-muted)]">Language</span>
                <LanguageSelector isMobile={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppNavbar;
