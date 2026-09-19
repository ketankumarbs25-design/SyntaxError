/**
 * FLOWSHIELD — Flood Telemetry & Early Warning Command Center
 * Hack-a-Matics 24-Hour Hackathon (Pentagram × BMSCE IEEE Computer Society)
 *
 * Full-viewport tactical dashboard (100vw × 100vh, no page-level scroll on desktop):
 * - Top Tactical Status Bar (Logo, Scenario Badge, "Synthetic Terrain" Disclosure, Clock)
 * - Left Column: Meteorological & Topographic Configuration Deck
 * - Center Hero: DPI-Aware HTML5 Canvas Heatmap + Vertical Tide-Staff Gauge + Horizontal Timeline Scrub Deck + Hydro Charts
 * - Right Column: Early Warning Center (Risk Classification Queue, ML Surrogate Prediction, Live Gemini AI Advisory)
 * - Bottom Section: 4-Scenario Comparative Matrix (Normal / Heavy / Drainage Failure / Blocked Channel)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';

// Simulation Engine & Types
import { DEFAULT_CONFIG, run } from './sim/index';
import type { SimConfig, SimState, CellState } from './sim/types';

// Web Worker & Scenario Types
import type { WorkerMessageResponse, ScenariosSummary, ScenarioResult } from './worker/simWorker';
import { usePlayback } from './hooks/usePlayback';
import { useTheme } from './hooks/useTheme';

// Tactical UI Components
import { ControlPanel } from './components/controls/ControlPanel';
import { LiveStats } from './components/stats/LiveStats';
import { HeatmapCanvas } from './components/grid/HeatmapCanvas';
import { TideStaffGauge } from './components/grid/TideStaffGauge';
import { TimelineControls } from './components/playback/TimelineControls';
import { EarlyWarnings } from './components/warnings/EarlyWarnings';
import { Charts } from './components/charts/Charts';
import { ScenarioComparison } from './components/scenarios/ScenarioComparison';
import { DemoNarrative } from './components/demo/DemoNarrative';
import { CellDetailModal } from './components/grid/CellDetailModal';
import { LiveFloodMap } from './components/map/LiveFloodMap';
import { AIChatbot } from './components/chatbot/AIChatbot';
import type { ChatAction } from './components/chatbot/AIChatbot';
import { SocialButton } from './components/kokonutui/social-button';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { UserMenu } from './components/auth/UserMenu';
import { LocationWeather } from './components/location/LocationWeather';
import { ThemeSwitcher } from './components/theme/ThemeSwitcher';
import { MinimalDashboard } from './components/minimal/MinimalDashboard';

export const AppContent: React.FC = () => {
  const { openAuthModal } = useAuth();

  // ─── Theme ────────────────────────────────────────────────────────────────
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  // ─── Simulation Configuration ─────────────────────────────────────────────
  const [config, setConfig] = useState<SimConfig>({
    ...DEFAULT_CONFIG,
    rows: 8,
    cols: 8,
    rainfallIntensity: 80,
    rainfallDuration: 90,
    drainageEfficiency: 1.0,
    elevationMultiplier: 1.0,
    seed: 42,
  });

  // Active scenario identifier
  const [activeScenarioName, setActiveScenarioName] = useState<string>('Heavy Rain');

  // ─── Simulation State & Timeline ──────────────────────────────────────────
  const [timeline, setTimeline] = useState<SimState[]>(() => run(config));
  const [scenarios, setScenarios] = useState<ScenariosSummary | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);

  // ─── Interactive Overlays ─────────────────────────────────────────────────
  const [blockedCells, setBlockedCells] = useState<Set<string>>(new Set());
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'sim' | 'weather' | 'scenarios' | 'monitor'>('overview');
  const [focusedMapZone, setFocusedMapZone] = useState<string | null>(null);

  // ─── Single Unified Location State (Shared across Map & Weather) ───────────
  const [sharedLocation, setSharedLocation] = useState<string>('Koramangala, Bengaluru');

  // ─── Web Worker Instance ──────────────────────────────────────────────────
  const workerRef = useRef<Worker | null>(null);

  // ─── Playback Engine Hook ─────────────────────────────────────────────────
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

  const selectedCell: CellState | null = useMemo(() => {
    if (!selectedCellId || !currentState) return null;
    return currentState.cells.find((c) => c.id === selectedCellId) || null;
  }, [selectedCellId, currentState]);

  // ─── Web Worker Lifecycle ─────────────────────────────────────────────────
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

      // Initial scenario synthesis
      worker.postMessage({
        id: 'init_scenarios',
        type: 'RUN_SCENARIOS',
        config,
      });
      setIsLoadingScenarios(true);

      return () => {
        worker.terminate();
      };
    } catch {
      // Fallback if worker fails
    }
  }, []);

  // ─── Simulation Trigger ───────────────────────────────────────────────────
  const runSimulationWithConfig = useCallback((newConfig: SimConfig) => {
    setIsSimulating(true);

    if (workerRef.current) {
      workerRef.current.postMessage({
        id: `sim_${Date.now()}`,
        type: 'RUN_SIMULATION',
        config: newConfig,
      });
      workerRef.current.postMessage({
        id: `scen_${Date.now()}`,
        type: 'RUN_SCENARIOS',
        config: newConfig,
      });
    } else {
      const newTimeline = run(newConfig);
      setTimeline(newTimeline);
      setIsSimulating(false);
    }
  }, []);

  const handleConfigChange = useCallback(
    (updated: Partial<SimConfig>) => {
      const newConfig = { ...config, ...updated };
      setConfig(newConfig);
      runSimulationWithConfig(newConfig);
    },
    [config, runSimulationWithConfig]
  );

  // ─── Scenario Presets ─────────────────────────────────────────────────────
  const handleSelectPresetScenario = useCallback(
    (scenarioKey: 'normal' | 'heavy' | 'failure' | 'blocked') => {
      let updated: Partial<SimConfig> = {};
      if (scenarioKey === 'normal') {
        updated = { rainfallIntensity: 20, drainageEfficiency: 1.0, rainfallDuration: 60 };
        setBlockedCells(new Set());
        setActiveScenarioName('Normal Rain');
      } else if (scenarioKey === 'heavy') {
        updated = { rainfallIntensity: 80, drainageEfficiency: 1.0, rainfallDuration: 90 };
        setBlockedCells(new Set());
        setActiveScenarioName('Heavy Rain');
      } else if (scenarioKey === 'failure') {
        updated = { rainfallIntensity: 80, drainageEfficiency: 0.2, rainfallDuration: 90 };
        setBlockedCells(new Set());
        setActiveScenarioName('Drainage Failure');
      } else if (scenarioKey === 'blocked') {
        updated = { rainfallIntensity: 80, drainageEfficiency: 1.0, rainfallDuration: 90 };
        setActiveScenarioName('Blocked Channel');
        // Block central valley outlet (row 4, col 4)
        if (workerRef.current) {
          setIsSimulating(true);
          workerRef.current.postMessage({
            id: `block_${Date.now()}`,
            type: 'RUN_BLOCKED_CHANNEL',
            config: { ...config, ...updated },
            blockedCell: { row: 4, col: 4 },
          });
          setConfig({ ...config, ...updated });
          return;
        }
      }

      const next = { ...config, ...updated };
      setConfig(next);
      runSimulationWithConfig(next);
    },
    [config, runSimulationWithConfig]
  );

  // Apply scenario from bottom comparative deck
  const handleApplyScenarioFromMatrix = useCallback(
    (scenario: ScenarioResult) => {
      setActiveScenarioName(scenario.name);
      const updated: Partial<SimConfig> = {
        rainfallIntensity: scenario.rainfallIntensity,
        drainageEfficiency: scenario.drainageEfficiency,
      };

      if (scenario.name === 'Blocked Channel') {
        if (workerRef.current) {
          setIsSimulating(true);
          workerRef.current.postMessage({
            id: `block_matrix_${Date.now()}`,
            type: 'RUN_BLOCKED_CHANNEL',
            config: { ...config, ...updated },
            blockedCell: { row: 4, col: 4 },
          });
          setConfig({ ...config, ...updated });
          return;
        }
      } else {
        setBlockedCells(new Set());
      }

      const next = { ...config, ...updated };
      setConfig(next);
      runSimulationWithConfig(next);
    },
    [config, runSimulationWithConfig]
  );

  // ─── Blocked Channel Toggle ──────────────────────────────────────────────
  const handleToggleBlockChannel = useCallback(
    (row: number, col: number) => {
      const cellId = `r${row}c${col}`;

      if (blockedCells.has(cellId)) {
        const nextBlocked = new Set(blockedCells);
        nextBlocked.delete(cellId);
        setBlockedCells(nextBlocked);
        runSimulationWithConfig(config);
      } else {
        if (workerRef.current) {
          setIsSimulating(true);
          workerRef.current.postMessage({
            id: `block_${Date.now()}`,
            type: 'RUN_BLOCKED_CHANNEL',
            config,
            blockedCell: { row, col },
          });
        }
      }
    },
    [blockedCells, config, runSimulationWithConfig]
  );

  const handleResetBlockedChannels = useCallback(() => {
    setBlockedCells(new Set());
    runSimulationWithConfig(config);
  }, [config, runSimulationWithConfig]);

  // ─── Demo Mode ────────────────────────────────────────────────────────────
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
    setActiveScenarioName('90s Hackathon Demo');

    const demoTimeline = run(demoConfig);
    setTimeline(demoTimeline);
    setStep(0);
    play();
  }, [setStep, play]);

  const handleExitDemoMode = useCallback(() => {
    setIsDemoMode(false);
  }, []);

  // ─── Location Weather → Apply Rainfall ────────────────────────────────────
  const handleApplyRealRainfall = useCallback(
    (intensity: number) => {
      handleConfigChange({ rainfallIntensity: Math.min(200, Math.max(0, intensity)) });
    },
    [handleConfigChange]
  );

  // ─── Unified Single-Location Change Handler (Syncs Map & Weather) ─────────
  const handleSharedLocationChange = useCallback((newLocation: string) => {
    setSharedLocation((prev) => (prev === newLocation ? prev : newLocation));
  }, []);

  // ─── View on Map Navigation ───────────────────────────────────────────────
  const handleViewOnMap = useCallback((zoneId: string) => {
    setSelectedCellId(zoneId);
    setFocusedMapZone(zoneId);
    setTimeout(() => {
      const mapSection = document.getElementById('live-flood-risk-map');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  }, []);

  // ─── Run Simulation Trigger from Map / Actions ────────────────────────────
  const handleRunSimulation = useCallback(() => {
    runSimulationWithConfig(config);
    setStep(0);
    play();
  }, [config, runSimulationWithConfig, setStep, play]);

  // ─── AI Chatbot Action Dispatcher ─────────────────────────────────────────
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
        case 'SELECT_ZONE': {
          const zone = (action.payload as string).toUpperCase();
          const zoneRow = zone.charCodeAt(0) - 65;
          const zoneCol = parseInt(zone.slice(1), 10) - 1;
          if (zoneRow >= 0 && zoneRow < config.rows && zoneCol >= 0 && zoneCol < config.cols) {
            const cellId = `r${zoneRow}c${zoneCol}`;
            setSelectedCellId(cellId);
            handleViewOnMap(cellId);
          }
          break;
        }
        case 'OPEN_AUTH': {
          openAuthModal(action.payload === 'signup' ? 'signup' : 'signin');
          break;
        }
      }
    },
    [handleConfigChange, handleStartDemoMode, play, pause, reset, config.rows, config.cols, openAuthModal, handleViewOnMap]
  );

  const chatContext = useMemo(
    () => ({
      config,
      stats: currentState?.stats ?? null,
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
    <div className="min-h-screen w-full bg-[#f4f5f8] text-slate-900 antialiased select-none">
      <MinimalDashboard
        config={config}
        currentState={currentState}
        onConfigChange={handleConfigChange}
        onRunSimulation={handleRunSimulation}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        activeTab={activeTab === 'overview' || activeTab === 'map' || activeTab === 'sim' || activeTab === 'weather' ? activeTab : 'overview'}
        sharedLocation={sharedLocation}
        onLocationChange={handleSharedLocationChange}
        mapComponent={
          <div className="w-full">
            <LiveFloodMap
              focusedZoneId={focusedMapZone}
              externalLocation={sharedLocation}
              onLocationChange={handleSharedLocationChange}
            />
          </div>
        }
        simulationComponent={
          <div className="space-y-6">
            {/* Header with Active Scenario & Operational Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">Active Scenario:</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  {activeScenarioName}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Euler Worker Engine · 60 FPS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <SocialButton label="Share Sim" />
                <ThemeSwitcher mode={themeMode} onSetMode={setThemeMode} />
                <UserMenu />
              </div>
            </div>

            {/* Narrated Demo Banner if active */}
            {isDemoMode && (
              <DemoNarrative
                time={currentState.time}
                rainfallDuration={config.rainfallDuration}
                criticalCount={currentState.stats.criticalCells}
                warningCount={currentState.stats.warningCells}
                onExit={handleExitDemoMode}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Control Panel */}
              <div className="lg:col-span-4 space-y-4">
                <ControlPanel
                  config={config}
                  onConfigChange={handleConfigChange}
                  emergencyMode={emergencyMode}
                  onToggleEmergencyMode={() => setEmergencyMode((prev) => !prev)}
                  blockedCellsCount={blockedCells.size}
                  onResetBlockedChannels={handleResetBlockedChannels}
                  isSimulating={isSimulating}
                  onStartDemoMode={handleStartDemoMode}
                  isDemoMode={isDemoMode}
                  onRunSimulation={handleRunSimulation}
                  onSelectPresetScenario={handleSelectPresetScenario}
                />
              </div>

              {/* Center Simulation Canvas & Gauge */}
              <div className="lg:col-span-8 space-y-4 flex flex-col items-center">
                <LiveStats
                  stats={currentState.stats}
                  totalCells={config.rows * config.cols}
                />

                <div className="w-full flex items-stretch justify-center gap-3">
                  <div className="flex-1 max-w-[580px]">
                    <HeatmapCanvas
                      cells={currentState.cells}
                      rows={config.rows}
                      cols={config.cols}
                      blockedCells={blockedCells}
                      selectedCellId={selectedCellId}
                      emergencyMode={emergencyMode}
                      onCellClick={(cell) => setSelectedCellId(cell.id)}
                    />

                    <div className="mt-2.5 px-3.5 py-2 flex flex-wrap items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-600">
                      <div className="flex items-center gap-3 font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          Safe (&lt;0.15m)
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          Warning (0.15-0.30m)
                        </span>
                        <span className="flex items-center gap-1.5 text-red-600">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          Critical (&ge;0.30m)
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Click sector to inspect</span>
                    </div>
                  </div>

                  <TideStaffGauge
                    maxWater={currentState.stats.maxWater}
                    criticalThreshold={0.30}
                    warningThreshold={0.15}
                    maxScale={1.20}
                  />
                </div>

                <TimelineControls
                  currentStep={currentStep}
                  totalSteps={timeline.length}
                  currentTime={currentState.time}
                  rainfallDuration={config.rainfallDuration}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                  onTogglePlay={togglePlay}
                  onReset={reset}
                  onSeek={setStep}
                  onSpeedChange={setPlaybackSpeed}
                  currentState={currentState}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-8">
                <Charts
                  timeline={timeline}
                  currentStep={currentStep}
                  rainfallIntensity={config.rainfallIntensity}
                  rainfallDuration={config.rainfallDuration}
                  onSeek={setStep}
                />
              </div>
              <div className="lg:col-span-4">
                <EarlyWarnings
                  cells={currentState.cells}
                  config={config}
                  stats={currentState.stats}
                  currentTime={currentState.time}
                  selectedCellId={selectedCellId}
                  onSelectCell={(cellId) => setSelectedCellId(cellId)}
                />
              </div>
            </div>

            {/* 4-Scenario Comparative Matrix */}
            <div className="w-full pt-4 border-t border-slate-100">
              <ScenarioComparison
                scenarios={scenarios}
                isLoading={isLoadingScenarios}
                onApplyScenario={handleApplyScenarioFromMatrix}
              />
            </div>
          </div>
        }
        weatherComponent={
          <div className="max-w-2xl mx-auto w-full py-4">
            <LocationWeather
              externalQuery={sharedLocation}
              onApplyRainfall={handleApplyRealRainfall}
              onCityChange={(city) => setSharedLocation(city)}
            />
          </div>
        }
      />

      {/* ─── Sector Detail Slide-In Inspector ─────────────────────────── */}
      <AnimatePresence>
        {selectedCell && (
          <CellDetailModal
            cell={selectedCell}
            isBlocked={blockedCells.has(selectedCell.id)}
            onToggleBlock={handleToggleBlockChannel}
            onClose={() => setSelectedCellId(null)}
            onViewOnMap={handleViewOnMap}
          />
        )}
      </AnimatePresence>

      {/* ─── Floating Tactical AI Chatbot ──────────────────────────────── */}
      <AIChatbot context={chatContext} onAction={handleChatAction} />

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
