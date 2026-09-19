/**
 * FLOWSHIELD — CellDetailModal
 *
 * Detailed tactical inspector for an individual grid sector.
 * Displays hydraulic head, neighbour gradient, population, and allows toggling drainage block.
 */

import React from 'react';
import type { CellState } from '../../sim/types';

interface CellDetailModalProps {
  cell: CellState | null;
  isBlocked: boolean;
  onToggleBlock: (row: number, col: number) => void;
  onClose: () => void;
}

export const CellDetailModal: React.FC<CellDetailModalProps> = ({
  cell,
  isBlocked,
  onToggleBlock,
  onClose,
}) => {
  if (!cell) return null;

  const { id, row, col, elevation, water, criticalDepth, drainageRate, population, risk, eta } = cell;
  const hydraulicHead = elevation + water;
  const ratio = criticalDepth > 0 ? (water / criticalDepth) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-950 border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 font-telemetry">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                risk === 'CRITICAL'
                  ? 'bg-red-500 animate-ping'
                  : risk === 'WARNING'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <h3 className="font-bold text-base text-white">
              Sector Telemetry: <span className="text-cyan-400">{id}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Water Depth</span>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">{water.toFixed(3)}m</div>
            <span className="text-[10px] text-slate-500">Critical: {criticalDepth.toFixed(2)}m</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Hydraulic Head</span>
            <div className="text-lg font-bold text-indigo-300 mt-0.5">{hydraulicHead.toFixed(3)}m</div>
            <span className="text-[10px] text-slate-500">Ground Elev: {elevation.toFixed(2)}m</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Inundation Ratio</span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                ratio >= 1.0 ? 'text-red-400' : ratio >= 0.6 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {(ratio * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">{risk}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">ETA to Critical</span>
            <div className="text-lg font-bold text-amber-300 mt-0.5">
              {eta === null ? '—' : eta === 0 ? 'CRITICAL NOW' : `${eta.toFixed(1)}m`}
            </div>
            <span className="text-[10px] text-slate-500">OLS 5-step slope</span>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 text-xs space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Grid Position:</span>
            <span>Row {row}, Column {col}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Exposed Population:</span>
            <span className="font-bold text-white">{population.toLocaleString()} residents</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Drainage Capacity:</span>
            <span>{(drainageRate * 60).toFixed(2)} mm/hr</span>
          </div>
        </div>

        {/* Action Button: Block / Unblock Channel */}
        <button
          onClick={() => onToggleBlock(row, col)}
          className={`
            w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all
            ${
              isBlocked
                ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500 text-red-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }
          `}
        >
          <span>{isBlocked ? '✕ Unblock Drainage Channel' : '⚠ Block Channel (Set Drainage = 0)'}</span>
        </button>
      </div>
    </div>
  );
};
