import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Waves,
  Radio,
  Compass,
  BellRing,
  Flame,
  Sparkles,
  Download,
  PhoneCall,
  AlertCircle,
  Bookmark,
  HelpCircle,
  Languages,
  Sun,
  Moon,
  RefreshCw,
  LogIn,
  Search,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../auth/UserMenu';

interface LeftFeatureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onManualRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenHistorical?: () => void;
  istTimeStr?: string;
}

export const LeftFeatureDrawer: React.FC<LeftFeatureDrawerProps> = ({
  isOpen,
  onClose,
  onManualRefresh,
  isRefreshing = false,
  onOpenHistorical,
  istTimeStr = '',
}) => {
  const { language, setLanguage, t } = useI18n();
  const { resolvedDark, toggleTheme } = useTheme();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Feature menu items with categories
  const menuSections = useMemo(
    () => [
      {
        title: 'Hydrological Telemetry',
        items: [
          {
            to: '/',
            label: t.navHome,
            desc: 'Real-time national flood map & forecast telemetry',
            icon: <Waves className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
            badge: 'Live Map',
          },
          {
            to: '/stations',
            label: t.navStations,
            desc: '1,500+ Central Water Commission active stations',
            icon: <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
            badge: '1,500 CWC',
          },
          {
            to: '/basins',
            label: t.navBasins,
            desc: 'Ganga, Brahmaputra, Godavari, Krishna & major basins',
            icon: <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
          },
          {
            to: '/bulletins',
            label: t.navBulletins,
            desc: 'Official Central Water Commission advisory bulletins',
            icon: <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          },
        ],
      },
      {
        title: 'Disaster Intelligence & Analytics',
        items: [
          {
            to: '/disasters',
            label: t.navDisasters,
            desc: 'Real-time GDACS, NASA EONET & UN disaster archive',
            icon: <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
            badge: 'GDACS Live',
          },
          {
            isButton: true,
            action: () => {
              onClose();
              onOpenHistorical?.();
            },
            label: 'Disaster AI Intelligence',
            desc: 'Deep ML historical risk models & landmark floods',
            icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
            badge: 'AI Engine',
          },
          {
            to: '/export',
            label: 'Data Export & Reports',
            desc: 'Download CSV, GeoJSON & JSON telemetry records',
            icon: <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          },
          {
            isButton: true,
            action: () => {
              onClose();
              window.dispatchEvent(new CustomEvent('fs-replay-intro'));
            },
            label: '3D Satellite Earth Intro',
            desc: 'Play cinematic satellite orbit zoom over India (Survey of India)',
            icon: <Globe className="w-4 h-4 text-sky-500 dark:text-sky-400" />,
            badge: 'Satellite 3D',
          },
        ],
      },
      {
        title: 'Citizen Safety & Response',
        items: [
          {
            isButton: true,
            action: () => {
              onClose();
              if (window.location.hash !== '#/') {
                window.location.hash = '#/';
              }
              setTimeout(() => {
                const el = document.getElementById('safety-advisory');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 150);
            },
            label: 'Flood Safety & Precautions',
            desc: 'NDMA survival protocols, 72h go-bag checklist & hotlines',
            icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
            badge: 'Life Safety',
          },
          {
            to: '/contact',
            label: 'Contact & SOS Helpline',
            desc: '24/7 disaster helplines, NDRF & district contacts',
            icon: <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />,
            badge: 'Emergency SOS',
          },
          {
            to: '/report-incident',
            label: 'Report Flood Incident',
            desc: 'Submit geo-tagged field observations & photos',
            icon: <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
          },
          {
            to: '/watchlist',
            label: 'Station Watchlist',
            desc: 'Custom bookmarked stations & high-risk alerts',
            icon: <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          },
          {
            to: '/help',
            label: t.navHelp,
            desc: 'Documentation, telemetry formulas & FAQs',
            icon: <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
          },
        ],
      },
    ],
    [t, onClose, onOpenHistorical]
  );

  // Search filter across features
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return menuSections;
    const q = searchQuery.toLowerCase();
    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q) ||
            item.badge?.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [menuSections, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] select-none">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Left Slide-in Drawer Container */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 w-full max-w-[340px] sm:max-w-[380px] bg-white/98 dark:bg-[#0E101B]/98 backdrop-blur-2xl border-r border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col z-[130] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Main Navigation Menu"
          >
            {/* Drawer Top Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/50">
              <NavLink
                to="/"
                onClick={onClose}
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                      FlowShield India
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      CWC LIVE
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    National Flood Early Warning Engine
                  </span>
                </div>
              </NavLink>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Close menu (Esc)"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search filter inside drawer */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search features, maps, stations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Scrollable Feature Menu Items */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 space-y-5">
              {filteredSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </div>

                  <div className="space-y-1">
                    {section.items.map((item, idx) => {
                      if (item.isButton) {
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        );
                      }

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to!}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center justify-between p-2.5 rounded-xl transition-all select-none group cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                    isActive
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-slate-100 dark:bg-slate-800'
                                  }`}
                                >
                                  {item.icon}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold flex items-center gap-1.5">
                                    <span
                                      className={
                                        isActive
                                          ? 'font-bold text-blue-700 dark:text-blue-300'
                                          : 'text-slate-900 dark:text-slate-100'
                                      }
                                    >
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                          isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                      >
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                                    {item.desc}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                                  isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400'
                                }`}
                              />
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Platform Controls inside Drawer */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Controls & Tools
                </div>

                {/* Theme Mode Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      {resolvedDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="text-left">
                      <div className="text-slate-900 dark:text-white font-semibold">Appearance Theme</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Currently {resolvedDark ? 'Dark Mode' : 'Light Mode'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {resolvedDark ? 'Light' : 'Dark'}
                  </span>
                </button>

                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Languages className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-slate-900 dark:text-white font-semibold">Language / भाषा</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {language === 'en' ? 'English (Current)' : 'हिन्दी (सक्रिय)'}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {language === 'en' ? 'हिन्दी' : 'English'}
                  </span>
                </button>

                {/* 3m Telemetry Sync Trigger */}
                {onManualRefresh && (
                  <button
                    type="button"
                    onClick={() => {
                      onManualRefresh();
                      onClose();
                    }}
                    disabled={isRefreshing}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="text-left">
                        <div className="text-slate-900 dark:text-white font-semibold">Sync Telemetry</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Auto-refreshes every 3 min</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {isRefreshing ? 'Syncing...' : 'Sync Now'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Bottom Profile & Info Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/80 shrink-0 space-y-2.5">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <UserMenu />
                  <span className="text-[11px] font-mono text-slate-400">{istTimeStr}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal('signin');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login / Sign Up</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {istTimeStr}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Central Water Commission (CWC)</span>
                </span>
                <span>v2.5</span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LeftFeatureDrawer;
