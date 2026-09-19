/**
 * FLOWSHIELD — FloodGrid
 *
 * Renders the terrain grid as a responsive CSS grid of divs.
 * Provides cell selection for detailed tactical inspection and channel blocking.
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
}

export const FloodGrid: React.FC<FloodGridProps> = ({
  cells,
  rows: _rows,
  cols,
  blockedCells = new Set(),
  selectedCellId = null,
  emergencyMode = false,
  onCellClick,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* CSS Grid Container */}
      <div
        className={`
          w-full max-w-[680px] p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80
          shadow-2xl backdrop-blur-sm
          ${emergencyMode ? 'emergency-mode-active ring-1 ring-red-500/30' : ''}
        `}
      >
        <div
          className="grid gap-1.5 sm:gap-2"
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
            />
          ))}
        </div>
      </div>

      {/* Grid Status & Legend bar */}
      <div className="w-full max-w-[680px] mt-2.5 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-telemetry bg-slate-900/60 border border-slate-800/60 rounded-lg text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500"></span>
            <span>SAFE (&lt;0.60)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/50 border border-amber-500"></span>
            <span>WARN (0.60–0.99)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 border border-red-500"></span>
            <span>CRITICAL (≥1.00)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Click cell to block drain</span>
        </div>
      </div>
    </div>
  );
};
