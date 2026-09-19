/**
 * FLOWSHIELD — Main Command Center Application
 *
 * Tactical 3-column control center layout:
 * - Col 1: Meteorological Controls, Presets, Scenarios, Demo Launcher
 * - Col 2: Telemetry Stats, Heatmap Grid, rAF Playback Timeline, Analytical Charts
 * - Col 3: Prioritized Early Warnings (ETA-sorted), Headless Scenario Stress Test
 *
 * STRICT PERFORMANCE & ANIMATION ADHERENCE:
 * - Full simulation precomputed in Web Worker
 * - Playback driven by rAF with fixed accumulator (10 sim steps/sec)
 * - Cell colors transitioned purely via CSS (no Motion springs on grid)
 * - Motion used exclusively for panel mount, warning list reordering, stat counters, and scenario bars
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';

// Simulation Engine & Types
import { DEFAULT_CONFIG, run } from './sim/index';
import type { SimConfig, SimState } from './sim/types';

// Web Worker & Hooks
import type { WorkerMessageResponse, ScenariosSummary } from './worker/simWorker';
import { usePlayback } from './hooks/usePlayback';

// Tactical UI Components
import { BackgroundPaths } from './components/kokonutui/background-paths';
import { ControlPanel } from './components/controls/ControlPanel';
import { FloodGrid } from './components/grid/FloodGrid';
import { LiveStats } from './components/stats/LiveStats';
import { TimelineControls } from './components/playback/TimelineControls';
import { EarlyWarnings } from './components/warnings/EarlyWarnings';
import { Charts } from './components/charts/Charts';
import { ScenarioComparison } from './components/scenarios/ScenarioComparison';
import { DemoNarrative } from './components/demo/DemoNarrative';
import { CellDetailModal } from './components/grid/CellDetailModal';

// Panel Mount Stagger Animation: 300ms, ease [0.22, 1, 0.36, 1]
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const App: React.FC = () => {
  // ─── Simulation Configuration ─────────────────────────────────────────────
  const [config, setConfig] = useState<SimConfig>({
    ...DEFAULT_CONFIG,
    rainfallIntensity: 80, // Heavy preset default
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

  // Playback controller (10 sim steps/sec decoupled rAF clock)
  const {
    currentStep,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    setStep,
    togglePlay,
    play,
    reset,
  } = usePlayback({
    totalSteps: timeline.length,
    initialStep: 0,
    targetStepsPerSec: 10,
  });

  // Active state at current playback index
  const currentState: SimState = timeline[currentStep] || timeline[0];

  // Selected cell object (from live state)
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

      // Initial scenario run
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
      // Fallback for environments where Web Workers are restricted
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

  // ─── Trigger Simulation when Config Changes ───────────────────────────────
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
        // Direct thread fallback
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

  // ─── Blocked Channel Interaction ──────────────────────────────────────────
  const handleToggleBlockChannel = useCallback(
    (row: number, col: number) => {
      const cellId = `r${row}c${col}`;

      if (blockedCells.has(cellId)) {
        // Unblock: re-run simulation without this block
        const nextBlocked = new Set(blockedCells);
        nextBlocked.delete(cellId);
        setBlockedCells(nextBlocked);
        runSimulationWithConfig(config);
      } else {
        // Block: send to worker to set drainageRate = 0
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
    // Preset: fixed seed + heavy storm (80 mm/hr, 90 min)
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

    // Precompute timeline and begin play
    const demoTimeline = run(demoConfig);
    setTimeline(demoTimeline);
    setStep(0);
    play();
  }, [setStep, play]);

  const handleExitDemoMode = useCallback(() => {
    setIsDemoMode(false);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#06090f] text-slate-200 overflow-x-hidden">
      {/* Subtle KokonutUI Ambient Background Paths (Accent Only, Low Opacity) */}
      <BackgroundPaths className="opacity-20 pointer-events-none" />

      {/* Top Tactical Command Header */}
      <header className="relative z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-telemetry font-bold text-sm">
              FS
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-telemetry font-bold tracking-wider uppercase text-white flex items-center gap-2">
                FLOWSHIELD <span className="text-cyan-400 text-xs">v2.4</span>
              </h1>
              <p className="text-[10px] font-telemetry text-slate-400">
                Deterministic Hydrodynamic Inundation Telemetry & Early Warning Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-telemetry">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Jacobi explicit Euler (dt=1m)</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <span>Grid: <strong className="text-white">{config.rows}×{config.cols}</strong></span>
              <span>Seed: <strong className="text-cyan-300">{config.seed}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main 3-Column Tactical Command Grid */}
      <main className="relative z-20 max-w-[1600px] mx-auto p-3 sm:p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
        >
          {/* ─── COLUMN 1: Meteorological Controls (3 cols on desktop) ─── */}
          <motion.div variants={panelVariants} className="lg:col-span-3 space-y-4">
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
          </motion.div>

          {/* ─── COLUMN 2: Map Heatmap & Timeline (6 cols on desktop) ─── */}
          <motion.div variants={panelVariants} className="lg:col-span-6 space-y-4 flex flex-col items-center">
            {/* Demo Mode Tactical Briefing */}
            {isDemoMode && (
              <DemoNarrative
                time={currentState.time}
                rainfallDuration={config.rainfallDuration}
                criticalCount={currentState.stats.criticalCells}
                warningCount={currentState.stats.warningCells}
                onExit={handleExitDemoMode}
              />
            )}

            {/* Tactical Live Metrics Strip */}
            <LiveStats
              stats={currentState.stats}
              totalCells={config.rows * config.cols}
            />

            {/* 8x8 FloodGrid Heatmap */}
            <FloodGrid
              cells={currentState.cells}
              rows={config.rows}
              cols={config.cols}
              blockedCells={blockedCells}
              selectedCellId={selectedCellId}
              emergencyMode={emergencyMode}
              onCellClick={(cell) => {
                setSelectedCellId(cell.id);
              }}
            />

            {/* Decoupled Playback Timeline */}
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

            {/* Recharts Hydrological Analytical Telemetry */}
            <Charts
              timeline={timeline}
              currentStep={currentStep}
              rainfallIntensity={config.rainfallIntensity}
              rainfallDuration={config.rainfallDuration}
              onSeek={setStep}
            />
          </motion.div>

          {/* ─── COLUMN 3: Prioritized Warnings & Scenarios (3 cols) ─── */}
          <motion.div variants={panelVariants} className="lg:col-span-3 space-y-4">
            {/* Prioritized Early Warning List */}
            <EarlyWarnings
              cells={currentState.cells}
              selectedCellId={selectedCellId}
              onSelectCell={(cellId) => setSelectedCellId(cellId)}
            />

            {/* Headless Multi-Scenario Stress Test */}
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

      {/* Sector Inspector Modal */}
      {selectedCell && (
        <CellDetailModal
          cell={selectedCell}
          isBlocked={blockedCells.has(selectedCell.id)}
          onToggleBlock={handleToggleBlockChannel}
          onClose={() => setSelectedCellId(null)}
        />
      )}
    </div>
  );
};

export default App;
