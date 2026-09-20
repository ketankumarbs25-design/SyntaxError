/**
 * FLOWSHIELD — FloodCell (Simplified)
 *
 * Clear, readable grid cells with friendly zone names (A1, A2, B1...).
 * Color-coded backgrounds: green = safe, yellow = warning, red = flooding.
 * Shows water depth clearly. No jargon.
 */

import React, { memo } from 'react';
import { MapPin } from 'lucide-react';
import type { CellState } from '../../sim/types';

interface FloodCellProps {
  cell: CellState;
  isBlocked?: boolean;
  isSelected?: boolean;
  emergencyMode?: boolean;
  onCellClick?: (cell: CellState) => void;
  onViewOnMap?: (cell: CellState) => void;
}

/** Convert row,col to friendly zone name: A1, A2, B1... */
function getZoneName(row: number, col: number): string {
  const letter = String.fromCharCode(65 + row); // A, B, C...
  return `${letter}${col + 1}`;
}

export const FloodCell: React.FC<FloodCellProps> = memo(({
  cell,
  isBlocked = false,
  isSelected = false,
  emergencyMode = false,
  onCellClick,
  onViewOnMap,
}) => {
  const { row, col, elevation, water, criticalDepth, risk, eta, population } = cell;

  const ratio = criticalDepth > 0 ? water / criticalDepth : 0;
  const isCritical = risk === 'CRITICAL';
  const isWarning = risk === 'WARNING';
  const zoneName = getZoneName(row, col);

  // Background color based on risk level
  let bgColor: string;
  let borderColor: string;

  if (isCritical) {
    const alpha = Math.min(0.95, 0.55 + Math.min(1, ratio - 1.0) * 0.4);
    bgColor = `rgba(239, 68, 68, ${alpha})`;
    borderColor = 'rgba(248, 113, 113, 0.9)';
  } else if (isWarning) {
    const alpha = Math.min(0.85, 0.35 + (ratio - 0.6) * 1.1);
    bgColor = `rgba(245, 158, 11, ${alpha})`;
    borderColor = 'rgba(251, 191, 36, 0.75)';
  } else {
    if (water > 0.001) {
      const alpha = Math.min(0.7, 0.15 + (water / (criticalDepth * 0.6)) * 0.45);
      bgColor = `rgba(6, 182, 212, ${alpha})`;
      borderColor = 'rgba(14, 165, 233, 0.5)';
    } else {
      const elevNorm = Math.min(1, Math.max(0, elevation / 1.5));
      const shade = Math.round(18 + elevNorm * 24);
      bgColor = `rgb(${shade}, ${shade + 8}, ${shade + 18})`;
      borderColor = 'rgba(30, 41, 59, 0.6)';
    }
  }

  const nonCriticalClass = emergencyMode && !isCritical ? 'cell-non-critical' : '';
  const criticalRingClass = isCritical ? 'critical-pulse ring-2 ring-red-500/80' : '';
  const selectedClass = isSelected ? 'ring-2 ring-cyan-400 z-30 shadow-lg shadow-cyan-500/25' : '';

  // Readable tooltip
  const tooltipText = `${zoneName} — Water: ${water.toFixed(2)}m / Critical: ${criticalDepth.toFixed(2)}m | Pop: ${population.toLocaleString()} | Status: ${risk}`;

  return (
    <div
      id={`cell-${cell.id}`}
      role="button"
      tabIndex={0}
      title={tooltipText}
      onClick={() => onCellClick?.(cell)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCellClick?.(cell);
        }
      }}
      className={`
        flood-cell relative flex flex-col justify-between p-2 rounded-xl cursor-pointer select-none
        border overflow-hidden min-h-[72px] sm:min-h-[84px]
        hover:scale-[1.03] hover:z-20 transition-all duration-150
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
      {/* Top: Zone Name + Map Action + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-semibold tracking-tight text-white/90 pointer-events-none">
            {zoneName}
          </span>
          {onViewOnMap && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewOnMap(cell);
              }}
              title={`View ${zoneName} on Live Flood Risk Map`}
              className="px-1.5 py-0.5 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-400 text-[8px] font-semibold text-cyan-300 hover:text-white transition-all cursor-pointer shadow-sm pointer-events-auto flex items-center gap-0.5"
            >
              <MapPin className="w-2.5 h-2.5" />
              <span>Map</span>
            </button>
          )}
        </div>

        {isBlocked && (
          <span
            title="Drainage Blocked"
            className="flex items-center justify-center w-4 h-4 rounded-full bg-red-950/90 border border-red-500 text-red-300 text-[8px] font-bold"
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

      {/* Center: Water Depth */}
      <div className="my-auto text-center pointer-events-none py-1">
        <div className="font-bold text-sm sm:text-base tracking-tight text-white drop-shadow-sm">
          {water < 0.01 ? 'Dry' : `${water.toFixed(2)}m`}
        </div>
        {population > 0 && (
          <div className="text-[9px] text-white/60 mt-0.5">
            👥 {population.toLocaleString()}
          </div>
        )}
      </div>

      {/* Bottom: Risk Badge */}
      <div className="flex items-center justify-between text-[9px] pointer-events-none pt-1 border-t border-white/10">
        <span
          className={`font-semibold tracking-wide px-1.5 py-0.5 rounded-md ${
            isCritical
              ? 'bg-red-500/20 text-red-200'
              : isWarning
              ? 'bg-amber-500/20 text-amber-200'
              : 'bg-emerald-500/15 text-emerald-300/80'
          }`}
        >
          {isCritical ? '🔴 FLOOD' : isWarning ? '🟡 RISK' : '🟢 SAFE'}
        </span>
        <span className="text-white/50 font-medium">
          {eta !== null ? (eta === 0 ? '⚠️' : `~${eta.toFixed(0)}m`) : ''}
        </span>
      </div>
    </div>
  );
});
