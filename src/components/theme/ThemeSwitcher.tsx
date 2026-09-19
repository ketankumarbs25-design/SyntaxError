/**
 * FLOWSHIELD — ThemeSwitcher
 *
 * Header dropdown for switching between Light / Dark / Automatic themes.
 * - Keyboard-accessible (Escape closes, Tab/Shift-Tab navigates options)
 * - Shows the currently active mode with a checkmark
 * - Closes on outside click
 * - Smooth transitions handled by CSS
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ThemeMode } from '../../hooks/useTheme';

interface ThemeSwitcherProps {
  mode: ThemeMode;
  onSetMode: (mode: ThemeMode) => void;
}

const OPTIONS: { value: ThemeMode; icon: string; label: string; sub: string }[] = [
  { value: 'light', icon: '☀️', label: 'Light', sub: 'Always light interface' },
  { value: 'dark',  icon: '🌙', label: 'Dark',  sub: 'Always dark interface' },
  { value: 'auto',  icon: '⚙️', label: 'Automatic', sub: 'Follow system preference' },
];

const MODE_ICON: Record<ThemeMode, string> = {
  light: '☀️',
  dark: '🌙',
  auto: '⚙️',
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ mode, onSetMode }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const handleSelect = (value: ThemeMode) => {
    onSetMode(value);
    close();
  };

  return (
    <div ref={containerRef} className="relative" role="region" aria-label="Theme switcher">
      {/* Trigger button */}
      <button
        id="theme-switcher-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${mode}. Click to change.`}
        onClick={() => setOpen((o) => !o)}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold
          border transition-all duration-200 select-none
          theme-switcher-btn
          ${open
            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
            : 'theme-btn-idle hover:bg-[var(--theme-surface-hover)] border-[var(--border-subtle)]'
          }
        `}
      >
        <span aria-hidden="true" className="text-sm leading-none">{MODE_ICON[mode]}</span>
        <span className="hidden sm:inline theme-text-muted">Theme</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Select theme"
          className={`
            absolute right-0 top-full mt-2 w-52 z-50
            rounded-xl border shadow-2xl overflow-hidden
            theme-dropdown
            animate-in fade-in slide-in-from-top-1 duration-150
          `}
        >
          <div className="p-1 space-y-0.5">
            {OPTIONS.map(({ value, icon, label, sub }) => {
              const isActive = mode === value;
              return (
                <button
                  key={value}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(value)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-150 group
                    ${isActive
                      ? 'theme-option-active'
                      : 'theme-option-idle hover:theme-option-hover'
                    }
                  `}
                >
                  <span className="text-base w-5 flex-shrink-0 leading-none" aria-hidden="true">
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold font-mono ${isActive ? 'theme-option-active-text' : 'theme-option-label'}`}>
                      {label}
                    </div>
                    <div className="text-[10px] theme-option-sub truncate">
                      {sub}
                    </div>
                  </div>
                  {isActive && (
                    <span className="flex-shrink-0 text-cyan-400 text-sm leading-none" aria-label="Currently selected">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-3 pb-2.5 pt-1 border-t theme-dropdown-footer">
            <p className="text-[10px] theme-text-faint font-mono">
              Preference saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
