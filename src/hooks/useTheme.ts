/**
 * FLOWSHIELD — useTheme
 *
 * Manages the three-mode theme system:
 *   - 'light'  → always light
 *   - 'dark'   → always dark
 *   - 'auto'   → follows prefers-color-scheme, updates dynamically
 *
 * Persists user choice in localStorage under key 'flowshield-theme'.
 * Applies 'data-theme' attribute to <html> to drive CSS variables.
 */

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'flowshield-theme';

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode: ThemeMode): void {
  const html = document.documentElement;
  const isDark = mode === 'dark' || (mode === 'auto' && getSystemDark());
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  } catch {
    /* ignore SSR / privacy mode */
  }
  return 'auto';
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  // Resolved: the actual dark/light applied right now
  const [resolvedDark, setResolvedDark] = useState<boolean>(() => {
    const m = readStoredMode();
    return m === 'dark' || (m === 'auto' && getSystemDark());
  });

  const setMode = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch { /* ignore */ }
    setModeState(next);
    applyTheme(next);
    setResolvedDark(next === 'dark' || (next === 'auto' && getSystemDark()));
  }, []);

  // On mount: apply the stored theme immediately (prevents any flash)
  useEffect(() => {
    applyTheme(mode);
    setResolvedDark(mode === 'dark' || (mode === 'auto' && getSystemDark()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for OS theme changes when in Auto mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (mode === 'auto') {
        applyTheme('auto');
        setResolvedDark(getSystemDark());
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return { mode, setMode, resolvedDark };
}
