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
import { AIChatbot } from './components/chatbot/AIChatbot';
import type { ChatAction } from './components/chatbot/AIChatbot';
import { SocialButton } from './components/kokonutui/social-button';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { UserMenu } from './components/auth/UserMenu';
import { LocationWeather } from './components/location/LocationWeather';
import { ThemeSwitcher } from './components/theme/ThemeSwitcher';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

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
  const [activeTab, setActiveTab] = useState<'monitor' | 'scenarios' | 'weather'>('monitor');

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
            setSelectedCellId(`r${zoneRow}c${zoneCol}`);
          }
          break;
        }
        case 'OPEN_AUTH': {
          openAuthModal(action.payload === 'signup' ? 'signup' : 'signin');
          break;
        }
      }
    },
    [handleConfigChange, handleStartDemoMode, play, pause, reset, config.rows, config.cols, openAuthModal]
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
    <div className="min-h-screen w-full command-grid-bg flex flex-col antialiased select-none overflow-x-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* ─── 1. Top Tactical Status Bar ────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl px-4 py-2.5 shadow-xl" style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--header-border)' }}>
        <div className="w-full max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Operational Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20">
              🌊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg text-white tracking-wide flex items-center gap-2">
                  FLOWSHIELD
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                    v2.5 Tactical Command
                  </span>
                </h1>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                Hydrodynamic Cellular Inundation &amp; Early Warning System
              </p>
            </div>
          </div>

<<<<<<< HEAD
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span>Grid: <strong className="text-white">{config.rows}×{config.cols}</strong></span>
              <span className="text-slate-700">•</span>
              <span>Seed: <strong className="text-cyan-300">{config.seed}</strong></span>
            </div>
            <SocialButton label="Share Sim" />
            <UserMenu />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-300 text-sm"
=======
          {/* Operational Badges & Telemetry */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            {/* Mandatory Synthetic Terrain Disclosure */}
            <span
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-cyan-300 font-bold tracking-tight"
              title="All terrain, elevation, and drainage metrics are generated via deterministic PRNG Mulberry32 lattice"
>>>>>>> 397bf60 (feat: rebuild FlowShield frontend as tactical command center)
            >
              SYNTHETIC TERRAIN
            </span>

            {/* Active Scenario Indicator */}
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold hidden md:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {activeScenarioName}
            </span>

            {/* Runtime Engine Status */}
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold hidden lg:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Web Worker Euler Engine (60 FPS)
            </span>

            {/* Hackathon Badge */}
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold hidden xl:inline-flex items-center gap-1">
              🏆 Pentagram × BMSCE IEEE
            </span>

            {/* View Switcher Tabs (Desktop / Mobile) */}
            <div className="flex items-center p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={() => setActiveTab('monitor')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'monitor'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'scenarios'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Scenarios
              </button>
              <button
                onClick={() => setActiveTab('weather')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTab === 'weather'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Weather
              </button>
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher mode={themeMode} onSetMode={setThemeMode} />
          </div>
        </div>
      </header>

      {/* ─── 2. Main Command Center Viewport ──────────────────────────────── */}
      <main className="w-full max-w-[1720px] mx-auto p-3 sm:p-4 flex-1 flex flex-col gap-4">
        {/* Narrated Demo Banner if active */}
        {isDemoMode && (
          <DemoNarrative
            time={currentState.time}
            rainfallDuration={config.rainfallDuration}
            criticalCount={currentState.stats.criticalCells}
            warningCount={currentState.stats.warningCells}
            onExit={() => setIsDemoMode(false)}
          />
        )}

        {activeTab === 'scenarios' ? (
          /* Full Scenarios Comparison View */
          <div className="space-y-4">
            <ScenarioComparison
              scenarios={scenarios}
              isLoading={isLoadingScenarios}
              onApplyScenario={handleApplyScenarioFromMatrix}
            />
            <Charts
              timeline={timeline}
              currentStep={currentStep}
              rainfallIntensity={config.rainfallIntensity}
              rainfallDuration={config.rainfallDuration}
              onSeek={setStep}
            />
          </div>
        ) : activeTab === 'weather' ? (
          /* Live Weather View */
          <div className="max-w-2xl mx-auto w-full py-4">
            <LocationWeather
              onApplyRainfall={(intensity) => {
                handleConfigChange({ rainfallIntensity: Math.min(200, Math.max(0, intensity)) });
                setActiveTab('monitor');
              }}
            />
          </div>
        ) : (
          /* Primary 3-Column Command Center Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* ══════ LEFT COLUMN: Controls & Presets (3 cols) ══════ */}
            <div className="lg:col-span-3 space-y-4">
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
                onRunSimulation={() => runSimulationWithConfig(config)}
                onSelectPresetScenario={handleSelectPresetScenario}
              />

              <div className="hidden lg:block">
                <LocationWeather
                  onApplyRainfall={(intensity) =>
                    handleConfigChange({ rainfallIntensity: Math.min(200, Math.max(0, intensity)) })
                  }
                />
              </div>
            </div>

            {/* ══════ CENTER HERO: Heatmap + Tide Gauge + Timeline + Charts (5 cols) ══════ */}
            <div className="lg:col-span-5 space-y-3.5 flex flex-col items-center">
              {/* Tactical Live HUD Metrics */}
              <LiveStats
                stats={currentState.stats}
                totalCells={config.rows * config.cols}
              />

              {/* Heatmap Canvas paired with Vertical Tide Gauge */}
              <div className="w-full flex items-stretch justify-center gap-2.5">
                <div className="flex-1 max-w-[560px]">
                  <HeatmapCanvas
                    cells={currentState.cells}
                    rows={config.rows}
                    cols={config.cols}
                    blockedCells={blockedCells}
                    selectedCellId={selectedCellId}
                    emergencyMode={emergencyMode}
                    onCellClick={(cell) => setSelectedCellId(cell.id)}
                  />

                  {/* Standardized Risk & Hydrology Legend */}
                  <div className="mt-2 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono bg-[#0a101f]/70 border border-[#17243b] rounded-xl text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500" />
                        Safe (&lt;0.15m)
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500" />
                        Warning (0.15-0.30m)
                      </span>
                      <span className="flex items-center gap-1.5 text-red-400">
                        <span className="w-2.5 h-2.5 rounded-sm bg-red-500/50 border border-red-500" />
                        Critical (&ge;0.30m)
                      </span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Click sector to inspect</span>
                  </div>
                </div>

                {/* Tactical Vertical Tide-Staff Gauge */}
                <TideStaffGauge
                  maxWater={currentState.stats.maxWater}
                  criticalThreshold={0.30}
                  warningThreshold={0.15}
                  maxScale={1.20}
                />
              </div>

              {/* Large Horizontal Timeline Scrub Bar */}
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

              {/* Analytics & Hydrodynamic Progression Charts */}
              <div className="w-full">
                <Charts
                  timeline={timeline}
                  currentStep={currentStep}
                  rainfallIntensity={config.rainfallIntensity}
                  rainfallDuration={config.rainfallDuration}
                  onSeek={setStep}
                />
              </div>
            </div>

            {/* ══════ RIGHT COLUMN: Early Warnings & Real AI Engine (4 cols) ══════ */}
            <div className="lg:col-span-4 space-y-4">
              <EarlyWarnings
                cells={currentState.cells}
                config={config}
                stats={currentState.stats}
                currentTime={currentState.time}
                selectedCellId={selectedCellId}
                onSelectCell={(cellId) => setSelectedCellId(cellId)}
              />

              {/* Collapsible Quick Comparative Matrix */}
              <ScenarioComparison
                scenarios={scenarios}
                isLoading={isLoadingScenarios}
                onApplyScenario={handleApplyScenarioFromMatrix}
              />
            </div>
          </div>
        )}
      </main>

      {/* ─── 3. Sector Detail Slide-In Inspector ─────────────────────────── */}
      <AnimatePresence>
        {selectedCell && (
          <CellDetailModal
            cell={selectedCell}
            isBlocked={blockedCells.has(selectedCell.id)}
            onToggleBlock={handleToggleBlockChannel}
            onClose={() => setSelectedCellId(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── 4. Floating Tactical AI Chatbot ──────────────────────────────── */}
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
