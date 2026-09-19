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
      <div
        className="w-full rounded-2xl overflow-hidden shadow-sm flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        {/* Banner Header */}
        <div
          className="px-4 py-3 flex items-center justify-between transition-colors"
          style={{
            background: hasCritical
              ? 'var(--status-crit-subtle)'
              : stats.warningCells > 0
              ? 'var(--status-warn-subtle)'
              : 'var(--bg-elevated)',
            borderBottom: `1px solid ${hasCritical
              ? 'var(--status-crit-border)'
              : stats.warningCells > 0
              ? 'var(--status-warn-border)'
              : 'var(--border-strong)'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{hasCritical ? '\ud83d\udea8' : stats.warningCells > 0 ? '\u26a0\ufe0f' : '\ud83d\udee1\ufe0f'}</span>
            <div>
              <h3 className="font-mono font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Early Warning Engine
              </h3>
              <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {hasCritical
                  ? `FLASH INUNDATION BREACH: ${stats.criticalCells} SECTOR(S)`
                  : stats.warningCells > 0
                  ? `ACCUMULATION DETECTED: ${stats.warningCells} SECTOR(S)`
                  : 'HYDROLOGIC BALANCE NOMINAL'}
              </div>
            </div>
          </div>

          <span
            className="text-xs px-2.5 py-1 rounded-full font-mono font-bold"
            style={{
              background: hasCritical
                ? 'var(--status-crit-subtle)'
                : stats.warningCells > 0
                ? 'var(--status-warn-subtle)'
                : 'var(--status-safe-subtle)',
              color: hasCritical
                ? 'var(--status-crit)'
                : stats.warningCells > 0
                ? 'var(--status-warn)'
                : 'var(--status-safe)',
              border: `1px solid ${hasCritical
                ? 'var(--status-crit-border)'
                : stats.warningCells > 0
                ? 'var(--status-warn-border)'
                : 'var(--status-safe-border)'}`,
            }}
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
                    className="p-2 rounded-xl text-xs font-mono cursor-pointer transition-all flex items-center justify-between select-none"
                    style={{
                      background: isSelected
                        ? 'var(--accent-subtle)'
                        : isCrit
                        ? 'var(--status-crit-subtle)'
                        : isWarn
                        ? 'var(--status-warn-subtle)'
                        : 'var(--bg-elevated)',
                      border: `1px solid ${isSelected
                        ? 'var(--accent-border)'
                        : isCrit
                        ? 'var(--status-crit-border)'
                        : isWarn
                        ? 'var(--status-warn-border)'
                        : 'var(--border-strong)'}`,
                      color: isCrit
                        ? 'var(--status-crit)'
                        : isWarn
                        ? 'var(--status-warn)'
                        : 'var(--text-secondary)',
                      outline: isSelected ? '2px solid var(--accent)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${isCrit ? 'animate-ping' : ''}`}
                        style={{
                          background: isCrit ? 'var(--status-crit)' : isWarn ? 'var(--status-warn)' : 'var(--accent)',
                        }}
                      />
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Sector {zone}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        ({cell.water.toFixed(2)}m / {cell.criticalDepth.toFixed(2)}m)
                      </span>
                    </div>

                    <div className="text-right">
                      {isCrit ? (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ color: 'var(--status-crit)', background: 'var(--status-crit-subtle)', border: '1px solid var(--status-crit-border)' }}
                        >
                          CRITICAL INUNDATION
                        </span>
                      ) : cell.eta !== null && cell.eta > 0 ? (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ color: 'var(--status-warn)', background: 'var(--status-warn-subtle)', border: '1px solid var(--status-warn-border)' }}
                        >
                          ETA: ~{cell.eta.toFixed(0)} min
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Approaching Limit</span>
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
