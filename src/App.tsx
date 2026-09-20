import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AppNavbar } from './components/layout/AppNavbar';
import { HomePage } from './pages/HomePage';
import { StationsPage } from './pages/StationsPage';
import { StationDetailPage } from './pages/StationDetailPage';
import { BasinsPage } from './pages/BasinsPage';
import { BulletinsPage } from './pages/BulletinsPage';
import { HelpPage } from './pages/HelpPage';
import { I18nProvider } from './i18n';
import { Waves } from 'lucide-react';
import { AuthComponent } from './components/ui/sign-up';

// Configure TanStack Query client with 3-minute auto-refresh defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 3 * 60 * 1000, // 3 minutes
      refetchOnWindowFocus: true,
      staleTime: 60 * 1000,
      retry: 2,
    },
  },
});

const AppShell: React.FC = () => {
  const qc = useQueryClient();

  const handleManualRefresh = () => {
    qc.invalidateQueries();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#08090E] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Main Navigation */}
      <AppNavbar onManualRefresh={handleManualRefresh} />

      {/* Main Page Content Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stations" element={<StationsPage />} />
          <Route path="/stations/:id" element={<StationDetailPage />} />
          <Route path="/basins" element={<BasinsPage />} />
          <Route path="/bulletins" element={<BulletinsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route
            path="/login"
            element={
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
                <AuthComponent
                  logo={
                    <div className="bg-blue-600 text-white rounded-lg p-1.5 shadow-md shadow-blue-500/20">
                      <Waves className="w-4 h-4" />
                    </div>
                  }
                  brandName="FlowShield India"
                  onClose={() => window.location.hash = '#/'}
                  onSuccess={() => window.location.hash = '#/'}
                />
              </div>
            }
          />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* App Footer */}
      <footer className="no-print w-full bg-white dark:bg-[#0E101B] border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900 dark:text-white">
              FlowShield India
            </span>
            <span>•</span>
            <span>National Flood Forecasting Network</span>
            <span>•</span>
            <span>Central Water Commission</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Auto-refreshes every 3 min</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>IST (UTC+05:30)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <HashRouter>
          <AppShell />
        </HashRouter>
      </I18nProvider>
    </QueryClientProvider>
  );
};

export default App;
