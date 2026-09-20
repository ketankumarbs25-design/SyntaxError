import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bell,
  X,
  Menu,
} from 'lucide-react';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { useTheme } from '../../hooks/useTheme';
import type { LiveAlertItem } from '../../lib/liveDataSource';

export type NavTabId =
  | 'home'
  | 'map'
  | 'weather'
  | 'sectors'
  | 'sector-details'
  | 'alerts'
  | 'reports'
  | 'about'
  | 'storm-lab'
  | 'safety';

interface NavbarProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSectorByName?: (name: string) => void;
  criticalCount?: number;
  warningCount?: number;
  alerts?: LiveAlertItem[];
}

export const NAV_ITEMS: Array<{
  id: NavTabId;
  label: string;
}> = [
  { id: 'home', label: 'Home' },
  { id: 'map', label: 'Live Map' },
  { id: 'weather', label: 'Weather' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'about', label: 'About' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onSelectSectorByName,
  criticalCount = 1,
  warningCount = 2,
  alerts = [],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsPopoverOpen, setAlertsPopoverOpen] = useState(false);
  const { mode: themeMode, setMode: setThemeMode } = useTheme();

  const totalAlerts = criticalCount + warningCount;

  const handleTabClick = (tab: NavTabId) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white/95 dark:bg-[#11131F]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors relative z-40">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left: FlowShield Brand */}
        <div
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg shadow-xs">
            <svg
              className="w-5 h-5 fill-current text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            FlowShield
          </span>
        </div>

        {/* Center: Clean Pill Navigation Links matching exact UI mockups */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentTab === item.id ||
              (item.id === 'sectors' && currentTab === 'sector-details');
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer select-none ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.label}
                {/* Active Underline Pill Indicator matching screenshot 1-5 */}
                {isActive && (
                  <motion.div
                    layoutId="navbarIndicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Search + Bell + User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search location bar */}
          <div className="relative hidden sm:block w-44 lg:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  if (onSelectSectorByName) {
                    onSelectSectorByName(searchQuery.trim());
                  }
                }
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Theme switcher */}
          <div className="hidden sm:block">
            <ThemeSwitcher mode={themeMode} onSetMode={setThemeMode} />
          </div>

          {/* Notification Bell with red badge 1 */}
          <div className="relative">
            <button
              onClick={() => setAlertsPopoverOpen(!alertsPopoverOpen)}
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Alerts & Warnings"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold px-0.5 ring-2 ring-white dark:ring-slate-900 shadow-xs">
                1
              </span>
            </button>

            {/* Quick Alerts Dropdown Popover */}
            <AnimatePresence>
              {alertsPopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 space-y-2"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      Live Bengaluru Alerts ({totalAlerts})
                    </span>
                    <button
                      onClick={() => {
                        setAlertsPopoverOpen(false);
                        handleTabClick('alerts');
                      }}
                      className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {alerts.slice(0, 3).map((al) => (
                      <div
                        key={al.id}
                        onClick={() => {
                          setAlertsPopoverOpen(false);
                          handleTabClick('alerts');
                        }}
                        className={`p-2 rounded-xl cursor-pointer hover:opacity-90 transition-opacity border ${
                          al.severity === 'Critical'
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400'
                            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{al.title}</span>
                          <span className="text-[10px] font-normal opacity-80">{al.timeAgo}</span>
                        </div>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {al.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar KK (matches screenshot exactly) */}
          <div
            title="Ketan Kumar (FlowShield Admin)"
            className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-sm ring-2 ring-blue-100 dark:ring-blue-900"
          >
            KK
          </div>

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1.5"
          >
            <div className="mb-2 px-1">
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              />
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-3 py-2 text-left rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
