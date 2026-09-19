/**
 * FLOWSHIELD — CellDetailModal (Simplified → Slide-in Panel)
 *
 * When you click a zone, this slides in from the right with clear details.
 * Plain English: "Water is 0.45m deep here. Flooding starts at 0.80m."
 */

import React from 'react';
import { motion } from 'motion/react';
import type { CellState } from '../../sim/types';

interface CellDetailModalProps {
  cell: CellState | null;
  isBlocked: boolean;
  onToggleBlock: (row: number, col: number) => void;
  onClose: () => void;
}

function getZoneName(row: number, col: number): string {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

export const CellDetailModal: React.FC<CellDetailModalProps> = ({
  cell,
  isBlocked,
  onToggleBlock,
  onClose,
}) => {
  if (!cell) return null;

  const { row, col, elevation, water, criticalDepth, drainageRate, population, risk, eta } = cell;
  const zoneName = getZoneName(row, col);
  const ratio = criticalDepth > 0 ? (water / criticalDepth) : 0;
  const percentFull = Math.min(100, ratio * 100);

  // Plain English status
  let statusEmoji = '🟢';
  let statusText = 'This zone is safe — no flooding concern.';
  let statusColor = 'text-emerald-400';

  if (risk === 'CRITICAL') {
    statusEmoji = '🔴';
    statusText = `This zone is flooding! Water has exceeded the safe limit.`;
    statusColor = 'text-red-400';
  } else if (risk === 'WARNING') {
    statusEmoji = '🟡';
    statusText = `Water is rising here. It could flood soon.`;
    statusColor = 'text-amber-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm bg-slate-950 border-l border-slate-700/60 p-5 overflow-y-auto flex flex-col gap-4 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{statusEmoji}</span>
            <div>
              <h3 className="font-bold text-lg text-white">Zone {zoneName}</h3>
              <p className="text-xs text-slate-400">Row {row + 1}, Column {col + 1}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status Message */}
        <div className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800/50`}>
          <p className={`text-sm font-medium ${statusColor}`}>{statusText}</p>
        </div>

        {/* Water Level Visual */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <div className="text-xs text-slate-400 mb-2">Water Level</div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-cyan-400">{water.toFixed(2)}m</div>
            <div className="text-sm text-slate-500 pb-1">of {criticalDepth.toFixed(2)}m max</div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                risk === 'CRITICAL'
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : risk === 'WARNING'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
              }`}
              style={{ width: `${percentFull}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0m (Dry)</span>
            <span className={risk === 'CRITICAL' ? 'text-red-400 font-bold' : ''}>
              {percentFull.toFixed(0)}% full
            </span>
            <span>{criticalDepth.toFixed(2)}m (Flood)</span>
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="text-xs text-slate-400">⛰️ Ground Level</div>
            <div className="text-lg font-bold text-white mt-1">{elevation.toFixed(2)}m</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="text-xs text-slate-400">👥 Population</div>
            <div className="text-lg font-bold text-white mt-1">{population.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="text-xs text-slate-400">🚰 Drainage</div>
            <div className="text-lg font-bold text-white mt-1">{(drainageRate * 60).toFixed(1)} mm/hr</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="text-xs text-slate-400">⏱️ Time to Flood</div>
            <div className="text-lg font-bold mt-1">
              {eta === null ? (
                <span className="text-emerald-400">Not expected</span>
              ) : eta === 0 ? (
                <span className="text-red-400">NOW</span>
              ) : (
                <span className="text-amber-400">~{eta.toFixed(0)} min</span>
              )}
            </div>
          </div>
        </div>

        {/* What does this mean */}
        <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/20">
          <div className="text-xs text-blue-400 font-medium mb-1">💡 What does this mean?</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {risk === 'CRITICAL'
              ? `Zone ${zoneName} has ${water.toFixed(2)}m of water — exceeding the safe limit of ${criticalDepth.toFixed(2)}m. ${population.toLocaleString()} people in this area may need evacuation.`
              : risk === 'WARNING'
              ? `Water in zone ${zoneName} is at ${percentFull.toFixed(0)}% capacity. If rain continues, this zone could flood${eta !== null && eta > 0 ? ` in approximately ${eta.toFixed(0)} minutes` : ' soon'}.`
              : `Zone ${zoneName} has good drainage and low water levels. No immediate flood risk.`
            }
          </p>
        </div>

        {/* Block/Unblock Action */}
        <button
          onClick={() => onToggleBlock(row, col)}
          className={`
            w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all
            ${
              isBlocked
                ? 'bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-300'
                : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/40 text-slate-200'
            }
          `}
        >
          <span>{isBlocked ? '🔓 Unblock Drainage' : '🧱 Block Drainage (Test scenario)'}</span>
        </button>
      </motion.div>
    </div>
  );
};
