import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AppNavbar } from './components/layout/AppNavbar';
import { HomePage } from './pages/HomePage';
import { I18nProvider } from './i18n';
import { HistoricalDisasterModal } from './components/historical/HistoricalDisasterModal';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AIChatbot } from './components/chatbot/AIChatbot';
import { Loader } from './components/ui/Loader';

// Lazy-loaded heavy pages for Lighthouse performance optimization
const StationsPage = React.lazy(() => import('./pages/StationsPage').then((m) => ({ default: m.StationsPage })));
const StationDetailPage = React.lazy(() => import('./pages/StationDetailPage').then((m) => ({ default: m.StationDetailPage })));
const BasinsPage = React.lazy(() => import('./pages/BasinsPage').then((m) => ({ default: m.BasinsPage })));
const BulletinsPage = React.lazy(() => import('./pages/BulletinsPage').then((m) => ({ default: m.BulletinsPage })));
const DisasterHistoryPage = React.lazy(() => import('./pages/DisasterHistoryPage').then((m) => ({ default: m.DisasterHistoryPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const IncidentReporterPage = React.lazy(() => import('./pages/IncidentReporterPage').then((m) => ({ default: m.IncidentReporterPage })));
const WatchlistPage = React.lazy(() => import('./pages/WatchlistPage').then((m) => ({ default: m.WatchlistPage })));
const ExportPage = React.lazy(() => import('./pages/ExportPage').then((m) => ({ default: m.ExportPage })));
const HelpPage = React.lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));

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

const AnimatedPageRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full"
      >
        <React.Suspense
          fallback={
            <div className="min-h-[420px] flex items-center justify-center">
              <Loader
                size="md"
                title="Loading Telemetry..."
                subtitle="Synchronizing Central Water Commission flood data..."
              />
            </div>
          }
        >
          <Routes location={location}>
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
        </React.Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const AppShell: React.FC = () => {
  const qc = useQueryClient();
  const [isHistoricalOpen, setIsHistoricalOpen] = useState(false);
  const [historicalCity] = useState('Bengaluru');

  const handleManualRefresh = () => {
    qc.invalidateQueries();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors">
      {/* 3D Satellite Earth Globe Intro Animation (once per session or on replay) */}
      <React.Suspense fallback={null}>
        <GlobeIntroOverlay />
      </React.Suspense>

      {/* Top Main Navigation */}
      <AppNavbar
        onManualRefresh={handleManualRefresh}
        onOpenHistorical={() => setIsHistoricalOpen(true)}
      />

      {/* Main Page Content Container */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-20 lg:pb-5">
        <AnimatedPageRoutes />
      </main>

        {/* App Footer */}
        <footer className="no-print w-full bg-[var(--surface)] border-t border-[var(--border)] py-4 px-6 sm:px-8 text-xs text-[var(--text-muted)] mb-14 lg:mb-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1560px] mx-auto">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-semibold text-[var(--text)]">
                FlowShield India
              </span>
              <span>•</span>
              <span>National flood forecasting network</span>
              <span>•</span>
              <span>Central Water Commission</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] flex-wrap">
              <span>Auto-refreshes every 3 min</span>
              <span>•</span>
              <span>WCAG 2.1 AA compliant</span>
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

        {/* Floating AI Flood Intelligence Assistant */}
        <AIChatbot />
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
