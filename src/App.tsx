/**
 * FLOWSHIELD — Main Application
 *
 * Clean 2-panel layout with:
 * - Left/Main: Flood map, playback, charts
 * - Right sidebar: Stats, controls, location weather, warnings, scenarios
 * - Floating AI Chatbot (Gemini) that can control the simulation
 *
 * Backend engine is COMPLETELY UNTOUCHED.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';

// Simulation Engine & Types (unchanged)
import { DEFAULT_CONFIG, run } from './sim/index';
import type { SimConfig, SimState } from './sim/types';

// Web Worker & Hooks (unchanged)
import type { WorkerMessageResponse, ScenariosSummary } from './worker/simWorker';
import { usePlayback } from './hooks/usePlayback';

// UI Components
import { ControlPanel } from './components/controls/ControlPanel';
import { LocationWeather } from './components/location/LocationWeather';
import { FloodGrid } from './components/grid/FloodGrid';
import { LiveStats } from './components/stats/LiveStats';
import { TimelineControls } from './components/playback/TimelineControls';
import { EarlyWarnings } from './components/warnings/EarlyWarnings';
import { Charts } from './components/charts/Charts';
import { ScenarioComparison } from './components/scenarios/ScenarioComparison';
import { DemoNarrative } from './components/demo/DemoNarrative';
import { CellDetailModal } from './components/grid/CellDetailModal';
import { AIChatbot } from './components/chatbot/AIChatbot';
import type { ChatAction } from './components/chatbot/AIChatbot';

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

export const App: React.FC = () => {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [weatherSearchQuery, setWeatherSearchQuery] = useState<string | null>(null);

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
      const initialScenarios = {
        normal: {
          name: 'Normal' as const,
          rainfallIntensity: 20,
          peakLevel: 0.18,
          maxCriticalCount: 0,
          timeToFirstCritical: null,
          peakAffectedArea: 2,
          peakAffectedPopulation: 1400,
          timeline: [],
        },
        heavy: {
          name: 'Heavy' as const,
          rainfallIntensity: 80,
          peakLevel: 0.72,
          maxCriticalCount: 6,
          timeToFirstCritical: 48,
          peakAffectedArea: 14,
          peakAffectedPopulation: 18200,
          timeline: [],
        },
        extreme: {
          name: 'Extreme' as const,
          rainfallIntensity: 160,
          peakLevel: 1.45,
          maxCriticalCount: 22,
          timeToFirstCritical: 28,
          peakAffectedArea: 38,
          peakAffectedPopulation: 46500,
          timeline: [],
        },
      };
      setScenarios(initialScenarios);
    }
  }, []);

  // ─── Simulation Runners ───────────────────────────────────────────────────
  const runSimulationWithConfig = useCallback(
    (newConfig: SimConfig) => {
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
    },
    []
  );

  const handleConfigChange = useCallback(
    (updated: Partial<SimConfig>) => {
      const newConfig = { ...config, ...updated };
      setConfig(newConfig);
      runSimulationWithConfig(newConfig);
    },
    [config, runSimulationWithConfig]
  );

  // ─── Blocked Channel ─────────────────────────────────────────────────────
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
          setWeatherSearchQuery(action.payload);
          setSidebarOpen(true);
          break;
        case 'SELECT_ZONE': {
          // Convert zone name like "A1" to cell id like "r0c0"
          const zone = (action.payload as string).toUpperCase();
          const zoneRow = zone.charCodeAt(0) - 65; // A=0, B=1...
          const zoneCol = parseInt(zone.slice(1), 10) - 1; // 1=0, 2=1...
          if (zoneRow >= 0 && zoneRow < config.rows && zoneCol >= 0 && zoneCol < config.cols) {
            const cellId = `r${zoneRow}c${zoneCol}`;
            setSelectedCellId(cellId);
          }
          break;
        }
      }
    },
    [handleConfigChange, handleStartDemoMode, play, pause, reset, config.rows, config.cols]
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
    <div className="relative min-h-screen bg-[#06090f] text-slate-200 overflow-x-hidden">
      {/* ─── Clean Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-lg">
              💧
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                FlowShield
                <span className="text-cyan-400 text-xs font-normal bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  v2.4
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Flood Simulation & Early Warning System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>Grid: <strong className="text-white">{config.rows}×{config.cols}</strong></span>
              <span className="text-slate-700">•</span>
              <span>Seed: <strong className="text-cyan-300">{config.seed}</strong></span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-300 text-sm"
            >
              {sidebarOpen ? '✕ Close' : '☰ Menu'}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content Area ────────────────────────────────────────────── */}
      <main className="relative z-20 max-w-[1440px] mx-auto p-3 sm:p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
        >
          {/* ══════ LEFT: Map + Playback + Charts (8 cols) ══════ */}
          <motion.div variants={panelVariants} className="lg:col-span-8 space-y-4 flex flex-col items-center">
            {isDemoMode && (
              <DemoNarrative
                time={currentState.time}
                rainfallDuration={config.rainfallDuration}
                criticalCount={currentState.stats.criticalCells}
                warningCount={currentState.stats.warningCells}
                onExit={handleExitDemoMode}
              />
            )}

            <LiveStats
              stats={currentState.stats}
              totalCells={config.rows * config.cols}
            />

            <FloodGrid
              cells={currentState.cells}
              rows={config.rows}
              cols={config.cols}
              blockedCells={blockedCells}
              selectedCellId={selectedCellId}
              emergencyMode={emergencyMode}
              onCellClick={(cell) => setSelectedCellId(cell.id)}
            />

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

            <Charts
              timeline={timeline}
              currentStep={currentStep}
              rainfallIntensity={config.rainfallIntensity}
              rainfallDuration={config.rainfallDuration}
              onSeek={setStep}
            />
          </motion.div>

          {/* ══════ RIGHT SIDEBAR (4 cols) ══════ */}
          <motion.div
            variants={panelVariants}
            className={`lg:col-span-4 space-y-4 ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
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
            />

            <LocationWeather
              onApplyRainfall={handleApplyRealRainfall}
              externalQuery={weatherSearchQuery}
            />

            <EarlyWarnings
              cells={currentState.cells}
              selectedCellId={selectedCellId}
              onSelectCell={(cellId) => setSelectedCellId(cellId)}
            />

            <ScenarioComparison
              scenarios={scenarios}
              isLoading={isLoadingScenarios}
              onApplyPreset={(intensity) => {
                handleConfigChange({ rainfallIntensity: intensity });
              }}
            />
          </motion.div>
        </motion.div>
      </main>

      {/* ─── Zone Inspector (Slide-in Panel) ──────────────────────────────── */}
      {selectedCell && (
        <CellDetailModal
          cell={selectedCell}
          isBlocked={blockedCells.has(selectedCell.id)}
          onToggleBlock={handleToggleBlockChannel}
          onClose={() => setSelectedCellId(null)}
        />
      )}

      {/* ─── AI Chatbot (Floating) ────────────────────────────────────────── */}
      <AIChatbot
        context={chatContext}
        onAction={handleChatAction}
      />
    </div>
  );
};

export default App;
