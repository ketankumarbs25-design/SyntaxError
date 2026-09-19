/**
 * FLOWSHIELD — EarlyWarnings
 *
 * Emergency Operations Early Warning Center:
 * - The primary tactical intelligence column on the dashboard
 * - Real-time prioritized Critical Inundation & Rising Water alert queue
 * - Integrated Trained ML Surrogate Model prediction card
 * - Integrated Live Gemini Emergency Advisory card
 * - Instant zone inspection triggers
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CellState, SimConfig, SimStats } from '../../sim/types';
import { MLPredictionCard } from '../ai/MLPredictionCard';
import { GeminiAdvisoryCard } from '../ai/GeminiAdvisoryCard';

const DEFAULT_STATS: SimStats = {
  safeCells: 0,
  warningCells: 0,
  criticalCells: 0,
  maxWater: 0,
  avgWater: 0,
  affectedArea: 0,
  affectedPopulation: 0,
  maxDepth: 0,
  predictedCriticalCount: 0,
  earliestCriticalTime: null,
};

interface EarlyWarningsProps {
  cells: CellState[];
  config: SimConfig;
  stats: SimStats;
  currentTime: number;
  selectedCellId?: string | null;
  onSelectCell?: (cellId: string) => void;
}

function getZoneName(row: number, col: number): string {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

export const EarlyWarnings: React.FC<EarlyWarningsProps> = ({
  cells,
  config,
  stats: statsProp,
  currentTime,
  selectedCellId = null,
  onSelectCell,
}) => {
  const stats: SimStats = statsProp ?? DEFAULT_STATS;
  // Sort vulnerable cells: Critical first, then lowest ETA, then highest water ratio
  const prioritizedWarnings = useMemo(() => {
    return cells
      .filter((c) => c.risk !== 'SAFE' || (c.eta !== null && c.eta > 0))
      .sort((a, b) => {
        if (a.risk === 'CRITICAL' && b.risk !== 'CRITICAL') return -1;
        if (b.risk === 'CRITICAL' && a.risk !== 'CRITICAL') return 1;
        if (a.eta !== null && b.eta !== null) return a.eta - b.eta;
        if (a.eta !== null && b.eta === null) return -1;
        if (b.eta !== null && a.eta === null) return 1;
        const ratioA = a.water / a.criticalDepth;
        const ratioB = b.water / b.criticalDepth;
        return ratioB - ratioA;
      });
  }, [cells]);

  const hasCritical = stats.criticalCells > 0;

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* ─── 1. Early Warning Status Card ──────────────────────────────────── */}
      <div className="w-full bg-[#0a101f]/90 border border-[#17243b] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md flex flex-col">
        {/* Banner Header */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
            hasCritical
              ? 'bg-red-500/15 border-red-500/30'
              : stats.warningCells > 0
              ? 'bg-amber-500/10 border-amber-500/25'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{hasCritical ? '🚨' : stats.warningCells > 0 ? '⚠️' : '🛡️'}</span>
            <div>
              <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                Early Warning Engine
              </h3>
              <div className="text-[10px] text-slate-400 font-mono">
                {hasCritical
                  ? `FLASH INUNDATION BREACH: ${stats.criticalCells} SECTOR(S)`
                  : stats.warningCells > 0
                  ? `ACCUMULATION DETECTED: ${stats.warningCells} SECTOR(S)`
                  : 'HYDROLOGIC BALANCE NOMINAL'}
              </div>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${
              hasCritical
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                : stats.warningCells > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {prioritizedWarnings.length} Active Alerts
          </span>
        </div>

        {/* Priority Alert Queue */}
        <div className="p-2.5 max-h-[220px] overflow-y-auto space-y-1.5">
          {prioritizedWarnings.length === 0 ? (
            <div className="py-6 text-center text-xs font-mono text-slate-400 flex flex-col items-center gap-1">
              <span className="text-xl">✅</span>
              <span>All 64 synthetic terrain sectors within safe threshold (&lt; 0.15m)</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {prioritizedWarnings.slice(0, 10).map((cell) => {
                const isSelected = selectedCellId === cell.id;
                const isCrit = cell.risk === 'CRITICAL';
                const isWarn = cell.risk === 'WARNING';
                const zone = getZoneName(cell.row, cell.col);

                return (
                  <motion.div
                    key={cell.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={() => onSelectCell?.(cell.id)}
                    className={`p-2 rounded-xl text-xs font-mono cursor-pointer border transition-all flex items-center justify-between select-none ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-500/10'
                        : isCrit
                        ? 'bg-red-950/40 border-red-500/40 text-red-200 hover:bg-red-900/30'
                        : isWarn
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200 hover:bg-amber-900/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCrit ? 'bg-red-400 animate-ping' : isWarn ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                      />
                      <span className="font-bold text-white">Sector {zone}</span>
                      <span className="text-[10px] text-slate-400">
                        ({cell.water.toFixed(2)}m / {cell.criticalDepth.toFixed(2)}m)
                      </span>
                    </div>

                    <div className="text-right">
                      {isCrit ? (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                          CRITICAL INUNDATION
                        </span>
                      ) : cell.eta !== null && cell.eta > 0 ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                          ETA: ~{cell.eta.toFixed(0)} min
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Approaching Limit</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ─── 2. Real ML Surrogate Model Prediction Card ────────────────────── */}
      <MLPredictionCard config={config} stats={stats} currentTime={currentTime} />

      {/* ─── 3. Real Live Gemini AI Emergency Advisory Card ───────────────── */}
      <GeminiAdvisoryCard
        config={config}
        stats={stats}
        cells={cells}
        currentTime={currentTime}
      />
    </div>
  );
};
