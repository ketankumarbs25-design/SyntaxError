/**
 * FLOWSHIELD — Universal Theme Context & Provider
 *
 * Provides synchronized dark / light mode across every page, component, and section.
 * Controls:
 *   - document.documentElement.classList.toggle('dark', isDark)
 *   - document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
 *   - document.body.classList.toggle('dark', isDark)
 * Persists user choice in localStorage under 'flowshield-theme'.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedDark: boolean;
  isDark: boolean;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'flowshield-theme';

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  } catch {
    /* ignore */
  }
  return 'dark'; // Default to rich dark mode
}

function applyThemeToDOM(isDark: boolean) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const body = document.body;

  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  if (isDark) {
    html.classList.add('dark');
    if (body) body.classList.add('dark');
  } else {
    html.classList.remove('dark');
    if (body) body.classList.remove('dark');
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  const calculateResolvedDark = useCallback((targetMode: ThemeMode): boolean => {
    if (targetMode === 'dark') return true;
    if (targetMode === 'light') return false;
    return getSystemDark();
  }, []);

  const [resolvedDark, setResolvedDark] = useState<boolean>(() => {
    return calculateResolvedDark(readStoredMode());
  });

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      try {
        localStorage.setItem(STORAGE_KEY, nextMode);
      } catch {}
      setModeState(nextMode);
      const isDark = calculateResolvedDark(nextMode);
      setResolvedDark(isDark);

      // Use View Transitions API if supported for butter-smooth GPU crossfade
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        (document as any).startViewTransition(() => {
          applyThemeToDOM(isDark);
        });
      } else {
        applyThemeToDOM(isDark);
      }
    },
    [calculateResolvedDark]
  );

  const toggleTheme = useCallback(() => {
    const nextMode: ThemeMode = resolvedDark ? 'light' : 'dark';
    setMode(nextMode);
  }, [resolvedDark, setMode]);

  // Initial apply on mount
  useEffect(() => {
    const isDark = calculateResolvedDark(mode);
    setResolvedDark(isDark);
    applyThemeToDOM(isDark);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen to system preference changes if in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const isDark = getSystemDark();
      setResolvedDark(isDark);
      applyThemeToDOM(isDark);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [mode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        resolvedDark,
        isDark: resolvedDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    return {
      mode: (isDark ? 'dark' : 'light') as ThemeMode,
      setMode: () => {},
      resolvedDark: isDark,
      isDark,
      toggleTheme: () => {},
    };
  }
  return context;
}
