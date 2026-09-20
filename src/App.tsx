import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AppNavbar } from './components/layout/AppNavbar';
import { HomePage } from './pages/HomePage';
import { StationsPage } from './pages/StationsPage';
import { StationDetailPage } from './pages/StationDetailPage';
import { BasinsPage } from './pages/BasinsPage';
import { BulletinsPage } from './pages/BulletinsPage';
import { DisasterHistoryPage } from './pages/DisasterHistoryPage';
import { HelpPage } from './pages/HelpPage';
import { ContactPage } from './pages/ContactPage';
import { IncidentReporterPage } from './pages/IncidentReporterPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { ExportPage } from './pages/ExportPage';
import { I18nProvider } from './i18n';
import { HistoricalDisasterModal } from './components/historical/HistoricalDisasterModal';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Global 3D Satellite Earth Intro Overlay (lazy-loaded so Three.js stays in separate chunk)
const GlobeIntroOverlay = React.lazy(() => import('./components/globe/GlobeIntroOverlay'));

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
  const [isHistoricalOpen, setIsHistoricalOpen] = useState(false);
  const [historicalCity] = useState('Bengaluru');

  const handleManualRefresh = () => {
    qc.invalidateQueries();
  };

  return (
    <div className="min-h-screen bg-[#EAEBED] dark:bg-[#05060A] text-slate-900 dark:text-slate-100 p-2 sm:p-3.5 lg:p-5 transition-colors">
      {/* 3D Satellite Earth Globe Intro Animation (once per session or on replay) */}
      <React.Suspense fallback={null}>
        <GlobeIntroOverlay />
      </React.Suspense>

      <div className="max-w-[1560px] mx-auto min-h-[calc(100vh-28px)] bg-[#FAFBFD] dark:bg-[#0C0E17] rounded-[24px] sm:rounded-[32px] border border-white/90 dark:border-slate-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
        {/* Top Main Navigation */}
        <AppNavbar
          onManualRefresh={handleManualRefresh}
          onOpenHistorical={() => setIsHistoricalOpen(true)}
        />

        {/* Main Page Content Container */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/stations/:id" element={<StationDetailPage />} />
            <Route path="/basins" element={<BasinsPage />} />
            <Route path="/bulletins" element={<BulletinsPage />} />
            <Route path="/disasters" element={<DisasterHistoryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/report-incident" element={<IncidentReporterPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/help" element={<HelpPage />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* App Footer */}
        <footer className="no-print w-full bg-white/70 dark:bg-[#0E101B]/70 border-t border-slate-200/80 dark:border-slate-800/80 py-5 px-6 sm:px-8 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

        {/* Historical Disaster Intelligence Modal */}
        <HistoricalDisasterModal
          isOpen={isHistoricalOpen}
          onClose={() => setIsHistoricalOpen(false)}
          initialCity={historicalCity}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <HashRouter>
              <AppShell />
            </HashRouter>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
