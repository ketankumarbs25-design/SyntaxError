/**
 * FLOWSHIELD — FloodCell
 *
 * High-performance grid cell rendered as a pure HTML div.
 * STRICT ANIMATION COMPLIANCE:
 * - NO Motion springs on color or geometry
 * - Sets CSS custom property `--depth` and `--risk-hue`
 * - Transitions via CSS: `transition: background-color 180ms linear`
 * - Critical cells receive the shared CSS `.critical-pulse` class
 */

import React, { memo } from 'react';
import type { CellState } from '../../sim/types';

interface FloodCellProps {
  cell: CellState;
  isBlocked?: boolean;
  isSelected?: boolean;
  emergencyMode?: boolean;
  onCellClick?: (cell: CellState) => void;
}

export const FloodCell: React.FC<FloodCellProps> = memo(({
  cell,
  isBlocked = false,
  isSelected = false,
  emergencyMode = false,
  onCellClick,
}) => {
  const { id, elevation, water, criticalDepth, risk, eta, population } = cell;

  const ratio = criticalDepth > 0 ? water / criticalDepth : 0;
  const isCritical = risk === 'CRITICAL';
  const isWarning = risk === 'WARNING';

  // Compute CSS background color based on risk & depth ratio
  // Uses CSS custom properties for 180ms linear transitions
  let bgColor: string;
  let borderColor: string;

  if (isCritical) {
    // Red / Crimson alert
    const alpha = Math.min(0.95, 0.55 + Math.min(1, ratio - 1.0) * 0.4);
    bgColor = `rgba(239, 68, 68, ${alpha})`;
    borderColor = 'rgba(248, 113, 113, 0.9)';
  } else if (isWarning) {
    // Amber / Warning
    const alpha = Math.min(0.85, 0.35 + (ratio - 0.6) * 1.1);
    bgColor = `rgba(245, 158, 11, ${alpha})`;
    borderColor = 'rgba(251, 191, 36, 0.75)';
  } else {
    // Safe: water shows as deep oceanic blue-green gradient
    if (water > 0.001) {
      const alpha = Math.min(0.7, 0.15 + (water / (criticalDepth * 0.6)) * 0.45);
      bgColor = `rgba(6, 182, 212, ${alpha})`;
      borderColor = 'rgba(14, 165, 233, 0.5)';
    } else {
      // Dry terrain: shaded by elevation (hills lighter, valleys darker)
      const elevNorm = Math.min(1, Math.max(0, elevation / 1.5));
      const shade = Math.round(18 + elevNorm * 24);
      bgColor = `rgb(${shade}, ${shade + 8}, ${shade + 18})`;
      borderColor = 'rgba(30, 41, 59, 0.6)';
    }
  }

  // Visual cues for emergency mode
  const nonCriticalClass = emergencyMode && !isCritical ? 'cell-non-critical' : '';
  const criticalRingClass = isCritical ? 'critical-pulse ring-2 ring-red-500/80' : '';
  const selectedClass = isSelected ? 'ring-2 ring-cyan-400 z-30 shadow-lg shadow-cyan-500/20' : '';

  return (
    <div
      id={`cell-${id}`}
      role="button"
      tabIndex={0}
      title={`${id} | Water: ${water.toFixed(3)}m | Crit: ${criticalDepth.toFixed(2)}m | Elev: ${elevation.toFixed(2)}m | Pop: ${population} | ETA: ${eta !== null ? (eta === 0 ? 'ACTIVE' : eta.toFixed(1) + 'm') : '—'}`}
      onClick={() => onCellClick?.(cell)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCellClick?.(cell);
        }
      }}
      className={`
        flood-cell relative flex flex-col justify-between p-1.5 rounded cursor-pointer select-none
        border overflow-hidden min-h-[64px] sm:min-h-[76px]
        hover:scale-[1.02] hover:z-20 transition-all duration-150
        ${criticalRingClass}
        ${selectedClass}
        ${nonCriticalClass}
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        ['--depth' as any]: `${water}m`,
        ['--risk-hue' as any]: isCritical ? '0' : isWarning ? '38' : '190',
      }}
    >
      {/* Top row: ID and Blocked Badge / Risk Indicator */}
      <div className="flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-telemetry font-bold tracking-tight text-slate-300/80">
          {id}
        </span>

        {isBlocked && (
          <span
            title="Blocked Drainage Channel"
            className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-950/90 border border-red-500 text-red-300 text-[8px] font-bold"
          >
            ✕
          </span>
        )}

        {!isBlocked && isCritical && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>

      {/* Middle row: Live Water Depth */}
      <div className="my-auto text-center pointer-events-none">
        <div className="font-telemetry font-bold text-xs sm:text-sm tracking-tight text-white drop-shadow-sm">
          {water.toFixed(2)}
          <span className="text-[9px] font-normal text-slate-300 ml-0.5">m</span>
        </div>
        <div className="text-[9px] font-telemetry text-slate-400">
          elev {elevation.toFixed(1)}m
        </div>
      </div>

      {/* Bottom row: ETA or Risk status */}
      <div className="flex items-center justify-between text-[9px] font-telemetry pointer-events-none pt-0.5 border-t border-white/10">
        <span
          className={`font-semibold tracking-wider ${
            isCritical
              ? 'text-red-200'
              : isWarning
              ? 'text-amber-200'
              : 'text-emerald-300/80'
          }`}
        >
          {risk}
        </span>
        <span className="text-slate-300 font-mono">
          {eta !== null ? (eta === 0 ? 'CRIT' : `${eta.toFixed(0)}m`) : '—'}
        </span>
      </div>
    </div>
  );
});
