import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Map,
  CloudSun,
  FlaskConical,
  ShieldAlert,
  Info,
  Menu,
  X,
} from 'lucide-react';
import { UserMenu } from '../auth/UserMenu';
import { SocialButton } from '../kokonutui/social-button';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { useTheme } from '../../hooks/useTheme';

export type NavTabId = 'map' | 'weather' | 'storm-lab' | 'safety' | 'about';

interface NavbarProps {
  currentTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  isSimulating?: boolean;
  criticalCount?: number;
}

export const NAV_ITEMS: Array<{
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}> = [
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'weather', label: 'Weather & Radar', icon: CloudSun, badge: 'BBC 1277333' },
  { id: 'storm-lab', label: 'Storm Lab', icon: FlaskConical },
  { id: 'safety', label: 'Citizen Safety', icon: ShieldAlert },
  { id: 'about', label: 'About FlowShield', icon: Info },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isSimulating = false,
  criticalCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode: themeMode, setMode: setThemeMode } = useTheme();

  const handleTabClick = (tab: NavTabId) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div
          onClick={() => handleTabClick('map')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-lg shadow-sm group-hover:border-cyan-500/50 transition-all">
            💧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight leading-none group-hover:text-cyan-300 transition-colors">
                FlowShield
              </span>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-1 hidden sm:block">
              Urban Flood Intelligence & Citizen Safety
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="relative z-10">{item.label}</span>
                {item.badge && (
                  <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
                {item.id === 'safety' && criticalCount > 0 && (
                  <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse font-bold">
                    {criticalCount} Alert
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {isSimulating && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Simulating...
            </span>
          )}

          <div className="hidden sm:block">
            <SocialButton label="Share" />
          </div>

          <ThemeSwitcher mode={themeMode} onSetMode={setThemeMode} />

          <UserMenu />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
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
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-3 space-y-1.5"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
