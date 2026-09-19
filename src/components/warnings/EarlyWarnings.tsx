/**
 * FLOWSHIELD — EarlyWarnings (Simplified)
 *
 * Plain English warnings: "Zone B3 will flood in ~12 minutes"
 * Sorted by urgency — most urgent first.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CellState } from '../../sim/types';

interface EarlyWarningsProps {
  cells: CellState[];
  selectedCellId?: string | null;
  onSelectCell?: (cellId: string) => void;
}

/** Convert row,col to friendly zone name */
function getZoneName(row: number, col: number): string {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

export const EarlyWarnings: React.FC<EarlyWarningsProps> = ({
  cells,
  selectedCellId = null,
  onSelectCell,
}) => {
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

  return (
    <div className="w-full flex flex-col bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <h3 className="font-semibold text-sm text-white">
            Warnings & Alerts
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/40 font-medium">
          {prioritizedWarnings.length} active
        </span>
      </div>

      {/* Warning List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[400px]">
        {prioritizedWarnings.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center text-center p-4">
            <span className="text-2xl mb-2">✅</span>
            <span className="text-sm text-slate-300 font-medium">All zones are safe</span>
            <span className="text-xs text-slate-500 mt-0.5">No flood warnings right now</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {prioritizedWarnings.map((cell) => {
              const isSelected = selectedCellId === cell.id;
              const isCrit = cell.risk === 'CRITICAL';
              const isWarn = cell.risk === 'WARNING';
              const zoneName = getZoneName(cell.row, cell.col);

              // Build human-readable message
              let message = '';
              if (isCrit) {
                message = `Zone ${zoneName} is flooding! Water: ${cell.water.toFixed(2)}m`;
              } else if (isWarn) {
                message = `Zone ${zoneName} at risk — water at ${cell.water.toFixed(2)}m`;
              } else if (cell.eta !== null && cell.eta > 0) {
                message = `Zone ${zoneName} may flood in ~${cell.eta.toFixed(0)} min`;
              }

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
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer
                    border transition-colors duration-150 select-none
                    ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-400/50'
                        : isCrit
                        ? 'bg-red-500/8 border-red-500/25 hover:bg-red-500/12'
                        : isWarn
                        ? 'bg-amber-500/8 border-amber-500/20 hover:bg-amber-500/12'
                        : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
                    }
                  `}
                >
                  {/* Icon */}
                  <span className="text-base flex-shrink-0">
                    {isCrit ? '🔴' : isWarn ? '🟡' : '🔮'}
                  </span>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 truncate">{message}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">
                        👥 {cell.population.toLocaleString()} people
                      </span>
                      {cell.eta !== null && cell.eta > 0 && (
                        <span className={`text-[10px] font-semibold ${cell.eta < 15 ? 'text-amber-400' : 'text-slate-400'}`}>
                          ⏱️ ~{cell.eta.toFixed(0)} min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                      isCrit
                        ? 'bg-red-500/20 text-red-400'
                        : isWarn
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-700/40 text-slate-400'
                    }`}
                  >
                    {isCrit ? 'FLOOD' : isWarn ? 'RISK' : 'WATCH'}
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
