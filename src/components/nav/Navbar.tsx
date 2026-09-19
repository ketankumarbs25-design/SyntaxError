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
  onOpenHistorical?: () => void;
}

export const NAV_ITEMS: Array<{
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}> = [
  { id: 'map',       label: 'Live Map',         icon: Map },
  { id: 'weather',   label: 'Weather & Radar',  icon: CloudSun, badge: 'BBC 1277333' },
  { id: 'storm-lab', label: 'Storm Lab',        icon: FlaskConical },
  { id: 'safety',    label: 'Citizen Safety',   icon: ShieldAlert },
  { id: 'about',     label: 'About',            icon: Info },
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
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl"
      style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">

        {/* Brand */}
        <div
          onClick={() => handleTabClick('map')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all"
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
            }}
          >
            💧
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-base sm:text-lg tracking-tight leading-none transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                FlowShield
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: 'var(--accent)',
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                }}
              >
                v2.4
              </span>
            </div>
            <p className="text-xs leading-none mt-1 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              Urban Flood Intelligence & Citizen Safety
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav
          className="hidden lg:flex items-center gap-0.5 p-1 rounded-2xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="relative px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                {/* Active background — flat elevated fill + accent left border */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--accent-border)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className="relative z-10 flex items-center"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="relative z-10">{item.label}</span>

                {item.badge && (
                  <span
                    className="relative z-10 text-xs px-1.5 rounded"
                    style={{
                      fontSize: '9px',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-strong)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Critical alert badge on Safety tab */}
                {item.id === 'safety' && criticalCount > 0 && (
                  <span
                    className="relative z-10 text-xs px-1.5 rounded-full font-bold"
                    style={{
                      fontSize: '9px',
                      background: 'var(--status-crit-subtle)',
                      color: 'var(--status-crit)',
                      border: '1px solid var(--status-crit-border)',
                    }}
                  >
                    {criticalCount} Alert
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Simulating indicator — static dot, no full-badge animate-pulse */}
          {isSimulating && (
            <span
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: 'var(--accent)' }} />
              Simulating
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
            className="lg:hidden p-2 rounded-xl cursor-pointer transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden px-4 py-3 space-y-1.5 backdrop-blur-2xl"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--header-bg)' }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  style={
                    isActive
                      ? {
                          background: 'var(--accent-subtle)',
                          border: '1px solid var(--accent-border)',
                          color: 'var(--accent)',
                        }
                      : {
                          background: 'var(--bg-elevated)',
                          border: '1px solid transparent',
                          color: 'var(--text-secondary)',
                        }
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        fontSize: '9px',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-strong)',
                      }}
                    >
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
