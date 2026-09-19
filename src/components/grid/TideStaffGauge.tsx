/**
 * FLOWSHIELD — TideStaffGauge
 *
 * Tactical vertical hydrological staff gauge showing maximum surface water depth
 * against standardized classification thresholds:
 * - Safe: < 0.15 m (Emerald)
 * - Warning: 0.15 m – 0.30 m (Amber)
 * - Critical: >= 0.30 m (Crimson)
 */

import React from 'react';
import { motion } from 'motion/react';

interface TideStaffGaugeProps {
  maxWater: number;
  criticalThreshold?: number; // 0.30m default
  warningThreshold?: number;  // 0.15m default
  maxScale?: number;          // 1.50m default
}

export const TideStaffGauge: React.FC<TideStaffGaugeProps> = ({
  maxWater,
  criticalThreshold = 0.30,
  warningThreshold = 0.15,
  maxScale = 1.20,
}) => {
  const clampedDepth = Math.max(0, maxWater);
  const fillPct = Math.min(100, (clampedDepth / maxScale) * 100);
  const isCritical = maxWater >= criticalThreshold;
  const isWarning = maxWater >= warningThreshold && !isCritical;

  // Threshold tick percentages from bottom
  const warnPct = (warningThreshold / maxScale) * 100;
  const critPct = (criticalThreshold / maxScale) * 100;

  return (
    <div className="flex flex-col items-center justify-between h-full bg-[#0a101f]/80 border border-[#17243b] rounded-2xl p-2.5 shadow-xl backdrop-blur-md select-none w-14 sm:w-16">
      <div className="text-[10px] font-mono text-slate-400 font-bold tracking-tight uppercase text-center">
        Tide
      </div>

      {/* Vertical Staff Tube */}
      <div className="relative w-7 sm:w-8 flex-1 my-2 bg-slate-950/80 rounded-full border border-slate-800 overflow-hidden flex flex-col justify-end">
        {/* Fill Tube Fluid */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${fillPct}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full rounded-b-full transition-colors duration-300 relative ${
            isCritical
              ? 'bg-gradient-to-t from-red-600 to-red-500 shadow-lg shadow-red-500/40'
              : isWarning
              ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/30'
              : 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-500/30'
          }`}
        >
          {/* Surface Meniscus Wave */}
          <div className="absolute top-0 inset-x-0 h-1 bg-white/40 animate-pulse rounded-full" />
        </motion.div>

        {/* Critical Threshold Line */}
        <div
          className="absolute inset-x-0 border-t border-dashed border-red-400/80 z-10 flex items-center justify-end pr-0.5"
          style={{ bottom: `${critPct}%` }}
          title="Critical Threshold: >= 0.30m"
        >
          <span className="text-[8px] font-mono text-red-400 font-bold bg-slate-950/80 px-0.5 rounded">
            0.30
          </span>
        </div>

        {/* Warning Threshold Line */}
        <div
          className="absolute inset-x-0 border-t border-dashed border-amber-400/80 z-10 flex items-center justify-end pr-0.5"
          style={{ bottom: `${warnPct}%` }}
          title="Warning Threshold: 0.15m"
        >
          <span className="text-[8px] font-mono text-amber-400 font-bold bg-slate-950/80 px-0.5 rounded">
            0.15
          </span>
        </div>

        {/* Depth Tick Marks */}
        {[0.25, 0.5, 0.75, 1.0].map((val) => {
          const posPct = (val / maxScale) * 100;
          if (posPct > 95) return null;
          return (
            <div
              key={val}
              className="absolute left-0 w-1.5 border-t border-slate-700/60 z-0"
              style={{ bottom: `${posPct}%` }}
            />
          );
        })}
      </div>

      {/* Numerical Peak Readout */}
      <div className="text-center font-mono">
        <div
          className={`text-xs font-bold tabular-nums ${
            isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-cyan-300'
          }`}
        >
          {maxWater.toFixed(2)}
        </div>
        <div className="text-[9px] text-slate-500 -mt-0.5">meters</div>
      </div>
    </div>
  );
};
