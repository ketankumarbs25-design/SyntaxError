/**
 * FLOWSHIELD — FloodGrid (Simplified)
 *
 * The main interactive flood map. Clean legend with plain labels.
 */

import React from 'react';
import type { CellState } from '../../sim/types';
import { FloodCell } from './FloodCell';

interface FloodGridProps {
  cells: CellState[];
  rows: number;
  cols: number;
  blockedCells?: Set<string>;
  selectedCellId?: string | null;
  emergencyMode?: boolean;
  onCellClick?: (cell: CellState) => void;
  onViewOnMap?: (cell: CellState) => void;
}

export const FloodGrid: React.FC<FloodGridProps> = ({
  cells,
  rows: _rows,
  cols,
  blockedCells = new Set(),
  selectedCellId = null,
  emergencyMode = false,
  onCellClick,
  onViewOnMap,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Grid Container */}
      <div
        className={`
          w-full max-w-[720px] p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50
          shadow-2xl backdrop-blur-sm
          ${emergencyMode ? 'emergency-mode-active ring-1 ring-red-500/30' : ''}
        `}
      >
        <div
          className="grid gap-2 sm:gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => (
            <FloodCell
              key={cell.id}
              cell={cell}
              isBlocked={blockedCells.has(cell.id)}
              isSelected={selectedCellId === cell.id}
              emergencyMode={emergencyMode}
              onCellClick={onCellClick}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full max-w-[720px] mt-2.5 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/40 border border-slate-700/40 rounded-xl text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500/40 border border-emerald-500"></span>
            <span>🟢 Safe</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500/50 border border-amber-500"></span>
            <span>🟡 At Risk</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-red-500/70 border border-red-500"></span>
            <span>🔴 Flooding</span>
          </span>
        </div>

        <div className="text-slate-500">
          Click any zone to inspect it
        </div>
      </div>
    </div>
  );
};
