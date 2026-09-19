/**
 * FLOWSHIELD — EarlyWarnings
 *
 * Urgent tactical alerts sorted by ETA ascending (most urgent first).
 * STRICT ANIMATION COMPLIANCE:
 * - Uses `<AnimatePresence>` + `layout` from 'motion/react'
 * - Smoothly reorders rows as ETA changes over simulation timesteps
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CellState } from '../../sim/types';

interface EarlyWarningsProps {
  cells: CellState[];
  selectedCellId?: string | null;
  onSelectCell?: (cellId: string) => void;
}

export const EarlyWarnings: React.FC<EarlyWarningsProps> = ({
  cells,
  selectedCellId = null,
  onSelectCell,
}) => {
  // Filter for cells requiring attention: CRITICAL, WARNING, or rising toward critical
  const prioritizedWarnings = useMemo(() => {
    return cells
      .filter((c) => c.risk !== 'SAFE' || (c.eta !== null && c.eta > 0))
      .sort((a, b) => {
        // 1. Critical cells first
        if (a.risk === 'CRITICAL' && b.risk !== 'CRITICAL') return -1;
        if (b.risk === 'CRITICAL' && a.risk !== 'CRITICAL') return 1;

        // 2. Both with ETA: smallest ETA first
        if (a.eta !== null && b.eta !== null) return a.eta - b.eta;

        // 3. Cell with ETA before cell without ETA
        if (a.eta !== null && b.eta === null) return -1;
        if (b.eta !== null && a.eta === null) return 1;

        // 4. Higher depth ratio first
        const ratioA = a.water / a.criticalDepth;
        const ratioB = b.water / b.criticalDepth;
        return ratioB - ratioA;
      });
  }, [cells]);

  return (
    <div className="w-full flex flex-col h-full bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-3 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h3 className="font-telemetry font-bold text-xs uppercase tracking-wider text-slate-200">
            Early Warnings & Alerts
          </h3>
        </div>
        <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          {prioritizedWarnings.length} Active
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-5 px-3 py-1.5 text-[10px] font-telemetry uppercase tracking-wider text-slate-500 bg-slate-900/40 border-b border-slate-800/60">
        <span>Zone</span>
        <span>Water</span>
        <span>Critical</span>
        <span>Status</span>
        <span className="text-right">ETA</span>
      </div>

      {/* Warning List with Smooth Layout Reordering */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 max-h-[460px]">
        {prioritizedWarnings.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <span className="text-emerald-500 text-base mb-1">✓</span>
            <span className="text-xs font-telemetry">All sectors nominal</span>
            <span className="text-[10px] text-slate-600 mt-0.5">No critical threshold breaches detected</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {prioritizedWarnings.map((cell) => {
              const isSelected = selectedCellId === cell.id;
              const isCrit = cell.risk === 'CRITICAL';
              const isWarn = cell.risk === 'WARNING';

              return (
                <motion.div
                  key={cell.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.15 },
                  }}
                  onClick={() => onSelectCell?.(cell.id)}
                  className={`
                    grid grid-cols-5 items-center px-2.5 py-1.5 rounded text-xs font-telemetry cursor-pointer
                    border transition-colors duration-150 select-none
                    ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/80 ring-1 ring-cyan-400'
                        : isCrit
                        ? 'bg-red-950/30 border-red-800/50 hover:bg-red-900/40'
                        : isWarn
                        ? 'bg-amber-950/20 border-amber-800/40 hover:bg-amber-900/30'
                        : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50'
                    }
                  `}
                >
                  {/* Zone ID */}
                  <span className="font-bold text-slate-300">
                    {cell.id}
                  </span>

                  {/* Current Level */}
                  <span className="text-cyan-300 font-semibold">
                    {cell.water.toFixed(2)}m
                  </span>

                  {/* Critical Threshold */}
                  <span className="text-slate-400">
                    {cell.criticalDepth.toFixed(2)}m
                  </span>

                  {/* Risk Badge */}
                  <div>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        isCrit
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : isWarn
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {cell.risk}
                    </span>
                  </div>

                  {/* ETA to Critical */}
                  <span
                    className={`text-right font-bold ${
                      cell.eta === 0
                        ? 'text-red-400'
                        : cell.eta !== null && cell.eta < 15
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.eta === null
                      ? '—'
                      : cell.eta === 0
                      ? 'ACTIVE'
                      : `${cell.eta.toFixed(1)}m`}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
