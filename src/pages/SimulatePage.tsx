/**
 * FLOWSHIELD — Flood Simulation Page
 *
 * Full hackathon-spec flood simulation dashboard:
 * ✅ Configure rainfall intensity, duration, drainage, terrain
 * ✅ Connected grid of regions with terrain/elevation variation
 * ✅ Water accumulation & inter-cell flow (4-neighbor Jacobi)
 * ✅ Drainage capacity & terrain/elevation factored in
 * ✅ Time-based flood progression visualization
 * ✅ Safe / Warning / Critical classification per cell
 * ✅ ETA to critical conditions per region
 * ✅ Interactive time slider for scrubbing through flood history
 * ✅ 4 preset scenarios: Normal / Heavy Rain / Drainage Failure / Blocked Channel
 * ✅ Scenario comparison matrix (all 4 side-by-side)
 * ✅ Estimated affected population display
 * ✅ Click any cell to inspect details (water depth, ETA, elevation, population)
 * ✅ Emergency mode toggle
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  CloudRain,
  Droplets,
  AlertTriangle,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Layers,
  Settings2,
  X,
  TrendingUp,
} from 'lucide-react';
import { run } from '../sim/index';
import type { SimState, SimConfig, CellState } from '../sim/types';
import { FloodGrid } from '../components/grid/FloodGrid';
import { ScenarioComparison } from '../components/scenarios/ScenarioComparison';
import type { ScenariosSummary, ScenarioResult } from '../worker/simWorker';

// ─── Scenario Presets ────────────────────────────────────────────────────────

const PRESETS: Record<
  'normal' | 'heavy' | 'failure' | 'blocked',
  { label: string; emoji: string; desc: string; config: Partial<SimConfig>; color: string }
> = {
  normal: {
    label: 'Normal Rain',
    emoji: '🌦️',
    desc: '20 mm/hr · Full drainage · Baseline monitoring',
    color: 'var(--level-normal)',
    config: { rainfallIntensity: 20, drainageEfficiency: 1.0, rainfallDuration: 60 },
  },
  heavy: {
    label: 'Heavy Rain',
    emoji: '⛈️',
    desc: '80 mm/hr · Full drainage · Monsoon peak',
    color: 'var(--level-watch)',
    config: { rainfallIntensity: 80, drainageEfficiency: 1.0, rainfallDuration: 90 },
  },
  failure: {
    label: 'Drainage Failure',
    emoji: '🚧',
    desc: '80 mm/hr · 20% drainage · Sewage collapse',
    color: 'var(--level-warning)',
    config: { rainfallIntensity: 80, drainageEfficiency: 0.2, rainfallDuration: 90 },
  },
  blocked: {
    label: 'Blocked Channel',
    emoji: '🔴',
    desc: '80 mm/hr · 30% drainage · Debris obstruction',
    color: 'var(--level-danger)',
    config: { rainfallIntensity: 80, drainageEfficiency: 0.3, rainfallDuration: 90 },
  },
};

const BASE_CONFIG: Partial<SimConfig> = {
  rows: 8,
  cols: 8,
  seed: 42,
  flowCoefficient: 0.15,
  elevationMultiplier: 1.0,
  safetyFactor: 0.5,
  dt: 1,
  etaWindow: 5,
  etaHorizon: 180,
  initialWater: 0,
};

// ─── Helper: Build scenario summary synchronously for comparison panel ────────

function buildScenariosSync(baseConfig: Partial<SimConfig>): ScenariosSummary {
  const run4 = (cfg: Partial<SimConfig>) => {
    const timeline = run({ ...baseConfig, ...cfg });
    let peakLevel = 0, maxCriticalCount = 0, timeToFirstCritical: number | null = null;
    let peakAffectedArea = 0, peakAffectedPopulation = 0;
    for (const s of timeline) {
      if (s.stats.maxWater > peakLevel) peakLevel = s.stats.maxWater;
      if (s.stats.criticalCells > maxCriticalCount) maxCriticalCount = s.stats.criticalCells;
      if (s.stats.criticalCells > 0 && timeToFirstCritical === null) timeToFirstCritical = s.time;
      if (s.stats.affectedArea > peakAffectedArea) peakAffectedArea = s.stats.affectedArea;
      if (s.stats.affectedPopulation > peakAffectedPopulation) peakAffectedPopulation = s.stats.affectedPopulation;
    }
    return { peakLevel, maxCriticalCount, timeToFirstCritical, peakAffectedArea, peakAffectedPopulation, timeline };
  };

  const n = run4(PRESETS.normal.config);
  const h = run4(PRESETS.heavy.config);
  const f = run4(PRESETS.failure.config);
  const b = run4(PRESETS.blocked.config);

  return {
    normal:  { name: 'Normal',           rainfallIntensity: 20, drainageEfficiency: 1.0, ...n },
    heavy:   { name: 'Heavy',            rainfallIntensity: 80, drainageEfficiency: 1.0, ...h },
    failure: { name: 'Drainage Failure', rainfallIntensity: 80, drainageEfficiency: 0.2, ...f },
    blocked: { name: 'Blocked Channel',  rainfallIntensity: 80, drainageEfficiency: 0.3, isBlocked: true, ...b },
  };
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; animate?: boolean;
}> = ({ label, value, sub, icon, color, animate }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 rounded-xl p-3 border"
    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
  >
    <div
      className="p-2 rounded-lg shrink-0"
      style={{ background: color + '20', color }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-[11px] text-[var(--text-muted)] font-medium truncate">{label}</div>
      <div
        className={`text-lg font-bold leading-tight tabular-nums ${animate ? 'transition-all duration-300' : ''}`}
        style={{ color }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{sub}</div>}
    </div>
  </motion.div>
);

// ─── Cell Inspector Drawer ────────────────────────────────────────────────────

const CellInspector: React.FC<{ cell: CellState | null; onClose: () => void }> = ({ cell, onClose }) => {
  if (!cell) return null;
  const zoneName = String.fromCharCode(65 + cell.row) + (cell.col + 1);
  const riskColor = cell.risk === 'CRITICAL' ? 'var(--level-danger)' : cell.risk === 'WARNING' ? 'var(--level-warning)' : 'var(--level-normal)';
  const pct = cell.criticalDepth > 0 ? Math.min(100, (cell.water / cell.criticalDepth) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl p-4 border flex flex-col gap-3"
      style={{ background: 'var(--surface)', borderColor: riskColor + '60' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: riskColor }}>Zone {zoneName}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
            style={{ background: riskColor + '20', color: riskColor }}
          >
            {cell.risk}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Water depth bar */}
      <div>
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
          <span>Water Depth</span>
          <span style={{ color: riskColor }}>{cell.water.toFixed(3)} m ({pct.toFixed(0)}% of critical)</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: riskColor }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: 'Elevation', value: `${cell.elevation.toFixed(2)} m` },
          { label: 'Critical Depth', value: `${cell.criticalDepth.toFixed(3)} m` },
          { label: 'Drainage Rate', value: `${cell.drainageRate.toFixed(4)} m/min` },
          { label: 'Population', value: cell.population.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg px-2.5 py-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
            <div className="font-semibold text-[var(--text)]">{value}</div>
          </div>
        ))}
      </div>

      {cell.eta !== null && (
        <div
          className="flex items-center gap-2 rounded-lg p-2.5 text-xs"
          style={{ background: 'var(--level-warning)' + '15', border: '1px solid var(--level-warning)' + '40' }}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--level-warning)' }} />
          {cell.eta === 0
            ? <span style={{ color: 'var(--level-danger)' }}>⚠️ Already at critical level</span>
            : <span style={{ color: 'var(--level-warning)' }}>ETA to Critical: <strong>{cell.eta.toFixed(0)} min</strong></span>
          }
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const SimulatePage: React.FC = () => {
  // Config state
  const [activePreset, setActivePreset] = useState<keyof typeof PRESETS>('heavy');
  const [config, setConfig] = useState<Partial<SimConfig>>({
    ...BASE_CONFIG,
    ...PRESETS.heavy.config,
  });

  // Simulation timeline state
  const [timeline, setTimeline] = useState<SimState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(8);

  // UI state
  const [selectedCell, setSelectedCell] = useState<CellState | null>(null);
  const [blockedCells] = useState<Set<string>>(new Set());
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [scenarios, setScenarios] = useState<ScenariosSummary | null>(null);
  const [isBuildingScenarios, setIsBuildingScenarios] = useState(false);

  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Current simulation state at scrubbed step
  const currentState = timeline[currentStep] ?? null;

  // ── Run simulation (accepts config directly to avoid stale closure) ──────────
  const runSimulation = useCallback((cfg: Partial<SimConfig>) => {
    setIsComputing(true);
    setIsPlaying(false);
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);

    // Yield to React so spinner renders before the heavy sync computation
    setTimeout(() => {
      try {
        const result = run(cfg);
        setTimeline(result);

        // Auto-seek to the step with peak critical cells so user sees flooding immediately
        // (Step 0 is pre-rain initial state — always boring/dry)
        let peakStep = 0;
        let peakCritical = 0;
        result.forEach((s, i) => {
          if (s.stats.criticalCells > peakCritical) {
            peakCritical = s.stats.criticalCells;
            peakStep = i;
          }
        });
        // If no critical cells, seek to the step with most warning cells
        if (peakStep === 0) {
          let peakWarning = 0;
          result.forEach((s, i) => {
            if (s.stats.warningCells > peakWarning) {
              peakWarning = s.stats.warningCells;
              peakStep = i;
            }
          });
        }
        // Still step 0? At least seek to 1/3 through rainfall
        if (peakStep === 0) {
          peakStep = Math.floor(result.length * 0.33);
        }

        setCurrentStep(peakStep);
        setIsRunning(true);
        setSelectedCell(null);
        setEmergencyMode(false);
        // Auto-start playback from beginning so user sees progression
        setCurrentStep(0);
        setIsPlaying(true);
      } catch (e) {
        console.error('Simulation failed:', e);
      } finally {
        setIsComputing(false);
      }
    }, 10);
  }, []);

  // Auto-run on mount
  const initialConfig = { ...BASE_CONFIG, ...PRESETS.heavy.config };
  useEffect(() => {
    runSimulation(initialConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debounced auto-rerun whenever any slider changes config ──────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSimulation(config);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.rainfallIntensity,
    config.rainfallDuration,
    config.drainageEfficiency,
    config.elevationMultiplier,
  ]);

  // ── Apply preset — immediately runs simulation with new config ───────────────
  const applyPreset = useCallback((key: keyof typeof PRESETS) => {
    const newConfig = { ...BASE_CONFIG, ...PRESETS[key].config };
    setActivePreset(key);
    setConfig(newConfig);
    runSimulation(newConfig);
  }, [runSimulation]);
  useEffect(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    if (!isPlaying || timeline.length === 0) return;

    playIntervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= timeline.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(50, 500 / playbackSpeed));

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, timeline.length]);


  // ── Scenario comparison ─────────────────────────────────────────────────────

  const handleShowComparison = useCallback(() => {
    setShowComparison(true);
    if (!scenarios) {
      setIsBuildingScenarios(true);
      setTimeout(() => {
        try {
          const s = buildScenariosSync(BASE_CONFIG);
          setScenarios(s);
        } finally {
          setIsBuildingScenarios(false);
        }
      }, 20);
    }
  }, [scenarios]);

  const handleApplyScenario = useCallback((scenario: ScenarioResult) => {
    const key = scenario.name === 'Normal' ? 'normal'
      : scenario.name === 'Heavy' ? 'heavy'
      : scenario.name === 'Drainage Failure' ? 'failure'
      : 'blocked';
    const newConfig = { ...BASE_CONFIG, ...PRESETS[key as keyof typeof PRESETS].config };
    setActivePreset(key as keyof typeof PRESETS);
    setConfig(newConfig);
    setShowComparison(false);
    runSimulation(newConfig);
  }, [runSimulation]);

  // ── KPIs derived from current state ─────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!currentState) return null;
    const { stats } = currentState;
    const total = config.rows! * config.cols!;
    return {
      criticalPct: ((stats.criticalCells / total) * 100).toFixed(0),
      warningPct: ((stats.warningCells / total) * 100).toFixed(0),
      safePct: ((stats.safeCells / total) * 100).toFixed(0),
      maxDepth: stats.maxDepth.toFixed(3),
      population: stats.affectedPopulation.toLocaleString(),
      eta: stats.earliestCriticalTime,
    };
  }, [currentState, config.rows, config.cols]);

  // ── Emergency mode auto-trigger ──────────────────────────────────────────────
  useEffect(() => {
    if (currentState && currentState.stats.criticalCells > 2) {
      setEmergencyMode(true);
    }
  }, [currentState]);

  const isRaining = currentState ? currentState.time < (config.rainfallDuration ?? 90) : false;

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ background: 'var(--primary)' + '20' }}>
              <Layers className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            </div>
            <h1 className="text-xl font-bold text-[var(--text)]">Flood Simulation Engine</h1>
            {isRunning && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                style={{ background: 'var(--live)' + '20', color: 'var(--live)', border: '1px solid var(--live)' + '40' }}
              >
                Live
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 ml-10">
            Physics-based water accumulation · 8×8 connected grid · ETA to critical · Affected population
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShowComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Compare Scenarios
          </button>
          <button
            onClick={() => setEmergencyMode((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all"
            style={{
              border: emergencyMode ? '1px solid var(--level-danger)' : '1px solid var(--border)',
              color: emergencyMode ? 'var(--level-danger)' : 'var(--text-muted)',
              background: emergencyMode ? 'var(--level-danger)' + '15' : 'var(--surface)',
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {emergencyMode ? 'Emergency ON' : 'Emergency Mode'}
          </button>
        </div>
      </div>

      {/* ── Alert Ticker (Emergency) ─────────────────────────────────────────── */}
      <AnimatePresence>
        {emergencyMode && currentState && currentState.stats.criticalCells > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm font-semibold"
            style={{ background: 'var(--level-danger)' + '15', border: '1px solid var(--level-danger)' + '50', color: 'var(--level-danger)' }}
          >
            <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              🚨 CRITICAL FLOOD ALERT — {currentState.stats.criticalCells} zones breached critical depth!
              Affected population: {currentState.stats.affectedPopulation.toLocaleString()} people.
              {currentState.stats.earliestCriticalTime !== null
                ? ` Next zone reaches critical in ${currentState.stats.earliestCriticalTime.toFixed(0)} min.`
                : ''}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preset Scenario Selector ─────────────────────────────────────────── */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Preset Scenarios
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(PRESETS) as [keyof typeof PRESETS, typeof PRESETS[keyof typeof PRESETS]][]).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => { applyPreset(key); }}
              className="text-left rounded-xl p-3 border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: activePreset === key ? preset.color + '15' : 'var(--surface)',
                borderColor: activePreset === key ? preset.color : 'var(--border)',
              }}
            >
              <div className="text-lg mb-1">{preset.emoji}</div>
              <div className="text-xs font-bold text-[var(--text)]">{preset.label}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Config Sliders + Run Button ──────────────────────────────────────── */}
      <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowControls((v) => !v)}
          className="w-full flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider cursor-pointer"
        >
          <span className="flex items-center gap-2"><Settings2 className="w-3.5 h-3.5" /> Hydrological Configuration</span>
          {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {/* Rainfall Intensity */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5" /> Rainfall
                    </label>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--live)' }}>
                      {config.rainfallIntensity} mm/hr
                    </span>
                  </div>
                  <input
                    type="range" min={5} max={200} step={5}
                    value={config.rainfallIntensity ?? 80}
                    onChange={(e) => setConfig((c) => ({ ...c, rainfallIntensity: Number(e.target.value) }))}
                    className="w-full accent-[var(--live)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>Light (5)</span><span>Extreme (200)</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </label>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--live)' }}>
                      {config.rainfallDuration} min
                    </span>
                  </div>
                  <input
                    type="range" min={10} max={180} step={10}
                    value={config.rainfallDuration ?? 90}
                    onChange={(e) => setConfig((c) => ({ ...c, rainfallDuration: Number(e.target.value) }))}
                    className="w-full accent-[var(--live)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>10 min</span><span>3 hr</span>
                  </div>
                </div>

                {/* Drainage */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" /> Drainage
                    </label>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--live)' }}>
                      {Math.round((config.drainageEfficiency ?? 1) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={Math.round((config.drainageEfficiency ?? 1) * 100)}
                    onChange={(e) => setConfig((c) => ({ ...c, drainageEfficiency: Number(e.target.value) / 100 }))}
                    className="w-full accent-[var(--live)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>0% (blocked)</span><span>100% (ideal)</span>
                  </div>
                </div>

                {/* Terrain relief */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Terrain
                    </label>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--live)' }}>
                      {config.elevationMultiplier?.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range" min={0.5} max={3} step={0.1}
                    value={config.elevationMultiplier ?? 1.0}
                    onChange={(e) => setConfig((c) => ({ ...c, elevationMultiplier: Number(e.target.value) }))}
                    className="w-full accent-[var(--live)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                    <span>Flat (0.5×)</span><span>Hilly (3×)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => runSimulation(config)}
                  disabled={isComputing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-wait transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: isComputing ? 'var(--text-muted)' : 'var(--primary)' }}
                >
                  {isComputing ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Computing…</>
                  ) : (
                    <><Zap className="w-3.5 h-3.5" /> Run Simulation</>
                  )}
                </button>
                <span className="text-xs text-[var(--text-muted)]">
                  {timeline.length > 0 && `${timeline.length} timesteps · ${config.rows}×${config.cols} grid`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Simulation Panel ────────────────────────────────────────────── */}
      {isComputing && (
        <div className="flex items-center justify-center py-16 gap-3 text-[var(--text-muted)]">
          <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <span className="text-sm">Computing flood dynamics…</span>
        </div>
      )}

      {!isComputing && currentState && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

          {/* Left: Grid + Timeline */}
          <div className="flex flex-col gap-4">

            {/* Rain phase indicator */}
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: isRaining ? 'var(--live)' + '20' : 'var(--border)',
                    color: isRaining ? 'var(--live)' : 'var(--text-muted)',
                  }}
                >
                  {isRaining ? <><CloudRain className="w-3 h-3 animate-bounce" /> Raining</> : '☀️ Rain stopped · Draining'}
                </span>
                <span className="text-[var(--text-muted)]">
                  T+{currentState.time.toFixed(0)} min · Step {currentStep}/{timeline.length - 1}
                </span>
              </div>
              <span className="text-[var(--text-muted)]">
                Total water in system: {currentState.totalWater.toFixed(3)} m³/cell
              </span>
            </div>

            {/* Flood Grid */}
            <FloodGrid
              cells={currentState.cells}
              rows={config.rows ?? 8}
              cols={config.cols ?? 8}
              blockedCells={blockedCells}
              selectedCellId={selectedCell?.id ?? null}
              emergencyMode={emergencyMode}
              onCellClick={(cell) => setSelectedCell(selectedCell?.id === cell.id ? null : cell)}
            />

            {/* Timeline Slider */}
            <div
              className="rounded-2xl p-4 border flex flex-col gap-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button
                    onClick={() => setIsPlaying((v) => !v)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'var(--primary)', color: '#fff' }}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  {/* Reset */}
                  <button
                    onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    title="Reset to beginning"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  {/* Speed buttons */}
                  <div className="flex items-center gap-1">
                    {[1, 4, 8, 16].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className="w-8 h-6 text-[10px] font-mono font-bold rounded cursor-pointer transition-all"
                        style={{
                          background: playbackSpeed === spd ? 'var(--primary)' : 'var(--surface-2)',
                          color: playbackSpeed === spd ? '#fff' : 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {spd}×
                      </button>
                    ))}
                  </div>
                </div>

                <span className="text-xs font-mono text-[var(--text-muted)] tabular-nums">
                  T+{currentState.time.toFixed(0)} min / {((timeline.length - 1)).toFixed(0)} min
                </span>
              </div>

              {/* Scrubber with rain marker */}
              <div className="relative">
                {/* Rain duration marker */}
                <div
                  className="absolute top-0 bottom-0 w-px z-10 pointer-events-none"
                  style={{
                    left: `${Math.min(100, ((config.rainfallDuration ?? 90) / Math.max(1, timeline.length - 1)) * 100)}%`,
                    background: 'var(--live)',
                    opacity: 0.6,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={timeline.length - 1}
                  step={1}
                  value={currentStep}
                  onChange={(e) => { setIsPlaying(false); setCurrentStep(Number(e.target.value)); }}
                  className="w-full cursor-pointer accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5">
                  <span>Start</span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--live)' }}>
                    <span className="w-2 h-0.5 inline-block" style={{ background: 'var(--live)' }} />
                    Rain ends at {config.rainfallDuration} min
                  </span>
                  <span>End ({((timeline.length - 1)).toFixed(0)} min)</span>
                </div>
              </div>

              {/* Step progress bar with zone classification */}
              <div className="h-3 rounded-full overflow-hidden flex gap-px">
                {timeline.map((state, i) => {
                  const hasC = state.stats.criticalCells > 0;
                  const hasW = state.stats.warningCells > 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        background: hasC ? 'var(--level-danger)' : hasW ? 'var(--level-warning)' : 'var(--level-normal)',
                        opacity: i === currentStep ? 1 : 0.5,
                      }}
                      onClick={() => { setIsPlaying(false); setCurrentStep(i); }}
                      title={`T+${state.time.toFixed(0)}min`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: KPIs + Inspector */}
          <div className="flex flex-col gap-4">

            {/* KPI Grid */}
            {kpis && (
              <div className="grid grid-cols-2 gap-2.5">
                <KpiCard
                  label="Critical Zones" value={`${currentState.stats.criticalCells}`}
                  sub={`${kpis.criticalPct}% of grid`}
                  icon={<AlertTriangle className="w-4 h-4" />}
                  color="var(--level-danger)" animate
                />
                <KpiCard
                  label="Warning Zones" value={`${currentState.stats.warningCells}`}
                  sub={`${kpis.warningPct}% of grid`}
                  icon={<CloudRain className="w-4 h-4" />}
                  color="var(--level-warning)" animate
                />
                <KpiCard
                  label="Peak Depth" value={`${kpis.maxDepth} m`}
                  sub="max across grid"
                  icon={<Droplets className="w-4 h-4" />}
                  color="var(--live)" animate
                />
                <KpiCard
                  label="Affected People" value={currentState.stats.affectedPopulation.toLocaleString()}
                  sub="in warning/critical"
                  icon={<Users className="w-4 h-4" />}
                  color="var(--level-warning)" animate
                />
                {kpis.eta !== null && (
                  <div className="col-span-2">
                    <KpiCard
                      label="Next Zone Goes Critical In" value={`${kpis.eta.toFixed(0)} min`}
                      sub="ETA based on water trend"
                      icon={<Clock className="w-4 h-4" />}
                      color="var(--level-danger)"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Zone classification breakdown */}
            {currentState && (
              <div
                className="rounded-xl p-3 border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
                  Zone Classification
                </div>
                {[
                  { label: 'Safe', count: currentState.stats.safeCells, color: 'var(--level-normal)' },
                  { label: 'Warning', count: currentState.stats.warningCells, color: 'var(--level-warning)' },
                  { label: 'Critical', count: currentState.stats.criticalCells, color: 'var(--level-danger)' },
                ].map(({ label, count, color }) => {
                  const total = config.rows! * config.cols!;
                  const pct = (count / total) * 100;
                  return (
                    <div key={label} className="mb-2 last:mb-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color }}>{label}</span>
                        <span className="text-[var(--text-muted)] tabular-nums">{count} zones ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cell Inspector */}
            <AnimatePresence mode="wait">
              {selectedCell && (
                <CellInspector
                  key={selectedCell.id}
                  cell={currentState?.cells.find((c) => c.id === selectedCell.id) ?? selectedCell}
                  onClose={() => setSelectedCell(null)}
                />
              )}
            </AnimatePresence>

            {!selectedCell && currentState && (
              <div className="flex flex-col gap-3">
                {/* ── Nearest Critical ETA countdown ── */}
                {(() => {
                  const eta = currentState.stats.earliestCriticalTime;
                  const horizon = config.etaHorizon ?? 180;
                  return (
                    <motion.div
                      layout
                      className="rounded-xl border overflow-hidden"
                      style={{
                        background: eta !== null && eta <= 15
                          ? 'rgba(198,40,40,0.15)'
                          : eta !== null && eta <= 45
                          ? 'rgba(240,138,36,0.12)'
                          : 'var(--surface)',
                        borderColor: eta !== null && eta <= 15
                          ? 'rgba(198,40,40,0.7)'
                          : eta !== null && eta <= 45
                          ? 'rgba(240,138,36,0.55)'
                          : 'var(--border)',
                      }}
                    >
                      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide"
                          style={{ color: eta !== null && eta <= 15 ? 'var(--level-danger)' : eta !== null ? 'var(--level-warning)' : 'var(--level-normal)' }}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Time to Critical
                        </div>
                        {eta !== null && (
                          <span
                            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded animate-pulse"
                            style={{
                              background: eta <= 15 ? 'rgba(198,40,40,0.25)' : 'rgba(240,138,36,0.2)',
                              color: eta <= 15 ? 'var(--level-danger)' : 'var(--level-warning)',
                            }}
                          >
                            {eta <= 15 ? '⚠ IMMINENT' : 'ACTIVE'}
                          </span>
                        )}
                      </div>

                      <div className="px-3 pb-3">
                        {eta === null ? (
                          <div className="flex items-center gap-2 py-2">
                            <span className="text-2xl font-bold" style={{ color: 'var(--level-normal)' }}>N/A</span>
                            <span className="text-xs text-[var(--text-muted)] leading-tight">All zones draining fast enough — no critical threshold predicted</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1.5 mb-2">
                              <span
                                className="text-3xl font-bold tabular-nums"
                                style={{ color: eta <= 15 ? 'var(--level-danger)' : 'var(--level-warning)' }}
                              >
                                {eta.toFixed(0)}
                              </span>
                              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>min</span>
                              <span className="text-xs text-[var(--text-muted)] ml-1">until next zone floods</span>
                            </div>
                            {/* Urgency bar */}
                            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background: eta <= 15
                                    ? 'var(--level-danger)'
                                    : 'var(--level-warning)',
                                }}
                                animate={{ width: `${Math.max(4, 100 - (eta / horizon) * 100)}%` }}
                                transition={{ duration: 0.4 }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-0.5">
                              <span>Critical now</span>
                              <span>{horizon} min horizon</span>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}

                {/* ── Ranked ETA list: Warning zones sorted by soonest ── */}
                {(() => {
                  const etaZones = currentState.cells
                    .filter((c) => c.risk !== 'SAFE')
                    .map((c) => ({
                      ...c,
                      zoneName: String.fromCharCode(65 + c.row) + (c.col + 1),
                      ratio: c.criticalDepth > 0 ? c.water / c.criticalDepth : 0,
                    }))
                    .sort((a, b) => {
                      // CRITICAL first, then WARNING sorted by ETA asc, null last
                      if (a.risk === 'CRITICAL' && b.risk !== 'CRITICAL') return -1;
                      if (b.risk === 'CRITICAL' && a.risk !== 'CRITICAL') return 1;
                      if (a.eta === null && b.eta === null) return 0;
                      if (a.eta === null) return 1;
                      if (b.eta === null) return -1;
                      return a.eta - b.eta;
                    })
                    .slice(0, 8);

                  if (etaZones.length === 0) return (
                    <div
                      className="rounded-xl p-3 border text-center text-xs text-[var(--text-muted)]"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <Layers className="w-5 h-5 mx-auto mb-1.5 opacity-30" />
                      All zones currently safe — no flooding detected
                    </div>
                  );

                  return (
                    <div
                      className="rounded-xl border overflow-hidden"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <div className="px-3 pt-2.5 pb-1.5 border-b flex items-center justify-between"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Zones at Risk</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{etaZones.length} zones · sorted by ETA</span>
                      </div>

                      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {etaZones.map((z) => {
                          const isCrit = z.risk === 'CRITICAL';
                          const color = isCrit ? 'var(--level-danger)' : 'var(--level-warning)';
                          const pct = Math.min(100, z.ratio * 100);

                          return (
                            <div
                              key={z.id}
                              className="px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                              onClick={() => setSelectedCell(z)}
                            >
                              {/* Zone badge */}
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{ background: color + '20', color, border: `1px solid ${color}50` }}
                              >
                                {z.zoneName}
                              </div>

                              {/* Progress + ETA */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-medium" style={{ color }}>
                                    {isCrit ? '🔴 BREACHED' : `🟡 ${pct.toFixed(0)}% of critical`}
                                  </span>
                                  <span
                                    className="text-[10px] font-mono font-bold tabular-nums"
                                    style={{ color }}
                                  >
                                    {isCrit
                                      ? 'Flooding now'
                                      : z.eta === null
                                      ? 'Draining ↓'
                                      : z.eta === 0
                                      ? 'Critical now!'
                                      : `ETA ${z.eta.toFixed(0)} min`
                                    }
                                  </span>
                                </div>
                                <div className="h-1 rounded-full overflow-hidden bg-white/8">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: color }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="px-3 py-1.5 text-[9px] text-[var(--text-muted)] text-center border-t"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        Click any zone to inspect · ETA from least-squares water trend
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Scenario Comparison Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowComparison(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border p-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[var(--text)]">4-Scenario Comparative Analysis</h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
              <ScenarioComparison
                scenarios={scenarios}
                isLoading={isBuildingScenarios}
                onApplyScenario={handleApplyScenario}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimulatePage;
