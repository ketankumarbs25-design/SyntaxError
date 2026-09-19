/**
 * FLOWSHIELD — Main Application (Multi-Page Humanized Architecture)
 *
 * Pages:
 * 1. Live Map: City-wide safety hero, 8x8 catchment grid, live timeline controls
 * 2. Weather & Radar: BBC Weather-grade telemetry suite (Station 1277333 & global)
 * 3. Storm Lab: Scenario comparison, hydrographs, cloudburst & drainage stress testing
 * 4. Citizen Safety: Neighborhood danger checker, 4-tier action plans, 24x7 hotlines, shelter directory
 * 5. About FlowShield: The human mission, physics simplified, observer credentials
 *
 * Backend engine is COMPLETELY UNTOUCHED.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';

// Simulation Engine & Types (unchanged)
import { DEFAULT_CONFIG, run } from './sim/index';
import type { SimConfig, SimState } from './sim/types';

// Web Worker & Scenario Types (unchanged)
import type { WorkerMessageResponse, ScenariosSummary } from './worker/simWorker';
import { usePlayback } from './hooks/usePlayback';

// Navigation & Humanized Page Views
import { Navbar, type NavTabId } from './components/nav/Navbar';
import { LiveMapView } from './components/pages/LiveMapView';
import { WeatherView } from './components/pages/WeatherView';
import { StormLabView } from './components/pages/StormLabView';
import { SafetyEvacuationView } from './components/pages/SafetyEvacuationView';
import { AboutView } from './components/pages/AboutView';

// Global Overlays & Modals
import { CellDetailModal } from './components/grid/CellDetailModal';
import { AIChatbot } from './components/chatbot/AIChatbot';
import type { ChatAction } from './components/chatbot/AIChatbot';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

export const AppContent: React.FC = () => {
  const { openAuthModal } = useAuth();

  // ─── Client-Side Hash Routing ──────────────────────────────────────────────
  const getInitialTab = (): NavTabId => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'weather' || hash === 'storm-lab' || hash === 'safety' || hash === 'about') {
      return hash as NavTabId;
    }
    return 'map';
  };

  const [currentTab, setCurrentTab] = useState<NavTabId>(getInitialTab);

  const handleSelectTab = useCallback((tab: NavTabId) => {
    setCurrentTab(tab);
    window.location.hash = tab === 'map' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'weather' || hash === 'storm-lab' || hash === 'safety' || hash === 'about') {
        setCurrentTab(hash as NavTabId);
      } else {
        setCurrentTab('map');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ─── Simulation Configuration ─────────────────────────────────────────────
  const [config, setConfig] = useState<SimConfig>({
    ...DEFAULT_CONFIG,
    rainfallIntensity: 80,
  });

  // ─── Simulation Results & Worker State ─────────────────────────────────────
  const [timeline, setTimeline] = useState<SimState[]>(() => run(config));
  const [scenarios, setScenarios] = useState<ScenariosSummary | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);

  // ─── Interactive States ───────────────────────────────────────────────────
  const [blockedCells, setBlockedCells] = useState<Set<string>>(new Set());
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // ─── Web Worker Instance ──────────────────────────────────────────────────
  const workerRef = useRef<Worker | null>(null);

  // Playback controller
  const {
    currentStep,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    setStep,
    togglePlay,
    play,
    pause,
    reset,
  } = usePlayback({
    totalSteps: timeline.length,
    initialStep: 0,
    targetStepsPerSec: 10,
  });

  const currentState: SimState = timeline[currentStep] || timeline[0];

  const selectedCell = useMemo(() => {
    if (!selectedCellId || !currentState) return null;
    return currentState.cells.find((c) => c.id === selectedCellId) || null;
  }, [selectedCellId, currentState]);

  // ─── Initialize Worker ────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const worker = new Worker(new URL('./worker/simWorker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (event: MessageEvent<WorkerMessageResponse>) => {
        const { type, timeline: newTimeline, scenarios: newScenarios, blockedCell } = event.data;

        if (type === 'SIMULATION_COMPLETE' && newTimeline) {
          setTimeline(newTimeline);
          setIsSimulating(false);
        } else if (type === 'SCENARIOS_COMPLETE' && newScenarios) {
          setScenarios(newScenarios);
          setIsLoadingScenarios(false);
        } else if (type === 'BLOCKED_COMPLETE' && newTimeline && blockedCell) {
          setTimeline(newTimeline);
          const cellId = `r${blockedCell.row}c${blockedCell.col}`;
          setBlockedCells((prev) => new Set(prev).add(cellId));
          setIsSimulating(false);
        }
      };

      workerRef.current = worker;

      worker.postMessage({
        id: 'initial_scenarios',
        type: 'RUN_SCENARIOS',
        config,
      });
      setIsLoadingScenarios(true);

      return () => {
        worker.terminate();
      };
    } catch {
      // Fallback to synchronous simulation if worker fails
      const fallbackTimeline = run(config);
      setTimeline(fallbackTimeline);
    }
  }, []);

  // ─── Run Simulation Helper ────────────────────────────────────────────────
  const runSimulationWithConfig = useCallback((newConfig: SimConfig) => {
    setIsSimulating(true);

    if (workerRef.current) {
      workerRef.current.postMessage({
        id: `sim_${Date.now()}`,
        type: 'RUN_SIMULATION',
        config: newConfig,
      });

      workerRef.current.postMessage({
        id: `scenarios_${Date.now()}`,
        type: 'RUN_SCENARIOS',
        config: newConfig,
      });
      setIsLoadingScenarios(true);
    } else {
      const newTimeline = run(newConfig);
      setTimeline(newTimeline);
      setIsSimulating(false);
    }
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleConfigChange = useCallback(
    (updated: Partial<SimConfig>) => {
      const newConfig = { ...config, ...updated };
      setConfig(newConfig);
      runSimulationWithConfig(newConfig);
    },
    [config, runSimulationWithConfig]
  );

  const handleToggleBlockChannel = useCallback(
    (cellId: string) => {
      const match = cellId.match(/^r(\d+)c(\d+)$/);
      if (!match) return;
      const row = parseInt(match[1], 10);
      const col = parseInt(match[2], 10);

      const isCurrentlyBlocked = blockedCells.has(cellId);

      if (isCurrentlyBlocked) {
        setBlockedCells((prev) => {
          const next = new Set(prev);
          next.delete(cellId);
          return next;
        });
        runSimulationWithConfig(config);
      } else {
        setIsSimulating(true);
        if (workerRef.current) {
          workerRef.current.postMessage({
            id: `block_${Date.now()}`,
            type: 'BLOCK_CELL',
            config,
            cell: { row, col },
          });
        } else {
          setBlockedCells((prev) => new Set(prev).add(cellId));
          runSimulationWithConfig(config);
        }
      }
    },
    [blockedCells, config, runSimulationWithConfig]
  );

  const handleResetBlockedChannels = useCallback(() => {
    setBlockedCells(new Set());
    runSimulationWithConfig(config);
  }, [config, runSimulationWithConfig]);

  // ─── Demo Mode ────────────────────────────────────────────────────
  const handleStartDemoMode = useCallback(() => {
    setIsDemoMode(true);
    const demoConfig: SimConfig = {
      ...DEFAULT_CONFIG,
      seed: 42,
      rainfallIntensity: 80,
      rainfallDuration: 90,
      drainageEfficiency: 0.9,
    };
    setConfig(demoConfig);
    setBlockedCells(new Set());
    setEmergencyMode(false);

    const demoTimeline = run(demoConfig);
    setTimeline(demoTimeline);
    setStep(0);
    play();
    handleSelectTab('map');
  }, [setStep, play, handleSelectTab]);

  const handleExitDemoMode = useCallback(() => {
    setIsDemoMode(false);
  }, []);

  // ─── Location Weather → Apply Rainfall ────────────────────────────────────
  const handleApplyRealRainfall = useCallback(
    (intensity: number) => {
      handleConfigChange({ rainfallIntensity: Math.min(200, Math.max(0, intensity)) });
      handleSelectTab('map');
    },
    [handleConfigChange, handleSelectTab]
  );

  // ─── AI Chatbot Action Handler ────────────────────────────────────────────
  const handleChatAction = useCallback(
    (action: ChatAction) => {
      switch (action.type) {
        case 'CHANGE_RAINFALL':
          handleConfigChange({ rainfallIntensity: action.payload });
          break;
        case 'CHANGE_DURATION':
          handleConfigChange({ rainfallDuration: action.payload });
          break;
        case 'CHANGE_DRAINAGE':
          handleConfigChange({ drainageEfficiency: action.payload / 100 });
          break;
        case 'CHANGE_TERRAIN':
          handleConfigChange({ elevationMultiplier: action.payload });
          break;
        case 'SET_PRESET':
          handleConfigChange({ rainfallIntensity: action.payload });
          break;
        case 'TOGGLE_EMERGENCY':
          setEmergencyMode((prev) => !prev);
          break;
        case 'START_DEMO':
          handleStartDemoMode();
          break;
        case 'PLAY':
          play();
          break;
        case 'PAUSE':
          pause();
          break;
        case 'RESET':
          reset();
          break;
        case 'SEARCH_LOCATION':
          handleSelectTab('weather');
          break;
        case 'SELECT_ZONE': {
          const zone = (action.payload as string).toUpperCase();
          const zoneRow = zone.charCodeAt(0) - 65;
          const zoneCol = parseInt(zone.slice(1), 10) - 1;
          if (zoneRow >= 0 && zoneRow < config.rows && zoneCol >= 0 && zoneCol < config.cols) {
            const cellId = `r${zoneRow}c${zoneCol}`;
            setSelectedCellId(cellId);
            handleSelectTab('map');
          }
          break;
        }
        case 'OPEN_AUTH': {
          openAuthModal(action.payload === 'signup' ? 'signup' : 'signin');
          break;
        }
      }
    },
    [handleConfigChange, handleStartDemoMode, play, pause, reset, config.rows, config.cols, openAuthModal, handleSelectTab]
  );

  // ─── Chatbot Context ─────────────────────────────────────────────────────
  const chatContext = useMemo(
    () => ({
      config,
      stats: currentState.stats,
      currentTime: currentState.time,
      totalSteps: timeline.length,
      isPlaying,
      playbackSpeed,
      isDemoMode,
      emergencyMode,
      blockedCellsCount: blockedCells.size,
    }),
    [config, currentState, timeline.length, isPlaying, playbackSpeed, isDemoMode, emergencyMode, blockedCells.size]
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col antialiased select-none overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ─── Modern Multi-Page Navigation Bar ──────────────────────────────── */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isSimulating={isSimulating}
        criticalCount={currentState.stats.criticalCells}
      />

      {/* ─── Page View Container ───────────────────────────────────────────── */}
      <main className="relative z-20 flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-5">
        <AnimatePresence mode="wait">
          {currentTab === 'map' && (
            <LiveMapView
              key="map"
              config={config}
              currentState={currentState}
              timeline={timeline}
              currentStep={currentStep}
              rainfallDuration={config.rainfallDuration}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onTogglePlay={togglePlay}
              onReset={reset}
              onSeek={setStep}
              onSpeedChange={setPlaybackSpeed}
              blockedCells={blockedCells}
              selectedCellId={selectedCellId}
              emergencyMode={emergencyMode}
              isDemoMode={isDemoMode}
              onCellClick={(cell) => setSelectedCellId(cell.id)}
              onExitDemoMode={handleExitDemoMode}
              onNavigateTab={handleSelectTab}
            />
          )}

          {currentTab === 'weather' && (
            <WeatherView
              key="weather"
              onApplyRainfall={handleApplyRealRainfall}
              onNavigateTab={handleSelectTab}
            />
          )}

          {currentTab === 'storm-lab' && (
            <StormLabView
              key="storm-lab"
              config={config}
              onConfigChange={handleConfigChange}
              timeline={timeline}
              currentStep={currentStep}
              onSeek={setStep}
              scenarios={scenarios}
              isLoadingScenarios={isLoadingScenarios}
              emergencyMode={emergencyMode}
              onToggleEmergencyMode={() => setEmergencyMode((prev) => !prev)}
              blockedCellsCount={blockedCells.size}
              onResetBlockedChannels={handleResetBlockedChannels}
              isSimulating={isSimulating}
              onStartDemoMode={handleStartDemoMode}
              isDemoMode={isDemoMode}
              onNavigateTab={handleSelectTab}
            />
          )}

          {currentTab === 'safety' && (
            <SafetyEvacuationView
              key="safety"
              currentState={currentState}
              onNavigateTab={handleSelectTab}
            />
          )}

          {currentTab === 'about' && (
            <AboutView
              key="about"
              onNavigateTab={handleSelectTab}
            />
          )}
        </AnimatePresence>
      </main>

      {/* ─── Zone Inspector (Slide-in Panel) ──────────────────────────────── */}
      {selectedCell && (
        <CellDetailModal
          cell={selectedCell}
          isBlocked={blockedCells.has(selectedCell.id)}
          onToggleBlock={(row, col) => handleToggleBlockChannel(`r${row}c${col}`)}
          onClose={() => setSelectedCellId(null)}
        />
      )}

      {/* ─── AI Chatbot (Floating) ────────────────────────────────────────── */}
      <AIChatbot
        context={chatContext}
        onAction={handleChatAction}
      />

      {/* ─── Authentication Modal (Google & Email) ─────────────────────────── */}
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
