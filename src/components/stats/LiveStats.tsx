/**
 * FLOWSHIELD — LiveStats
 *
 * Severity-scaled status tiles:
 * - ZERO state (count = 0):  neutral surface bg + muted text + thin colored left-border strip.
 *   The dashboard looks calm when the city is safe.
 * - ACTIVE state (count > 0): low-opacity tinted bg + saturated 1px border + status-colored
 *   number text.  Critical additionally gets .pulse-critical shadow.
 *
 * Color contract:
 *   - Status colors appear ONLY on the metric number, the left strip, and the small dot.
 *   - Card backgrounds are always var(--bg-surface) or a very low-opacity tint.
 *   - Numbers always use status-colored text on a dark/neutral surface → contrast passes 4.5:1.
 *     White text is NEVER placed on a colored fill — avoiding the amber-contrast failure.
 */

import React, { useEffect, useRef } from 'react';
import { useSpring } from 'motion/react';
import type { SimStats } from '../../sim/types';

interface LiveStatsProps {
  stats: SimStats;
  totalCells: number;
}

interface CounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<CounterProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
}) => {
  const spring = useSpring(value, { stiffness: 180, damping: 26 });
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (textRef.current) {
        textRef.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
  }, [spring, decimals, prefix, suffix]);

  return (
    <span ref={textRef} className="font-bold tabular-nums">
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
};

/* ── Shared chip wrapper — thin 3px left strip as the sole color identifier ── */
const chipBase: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '1rem',
  padding: '0.875rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '0.375rem',
};

export const LiveStats: React.FC<LiveStatsProps> = ({ stats: statsProp, totalCells }) => {
  const stats = statsProp ?? {
    safeCells: 0, warningCells: 0, criticalCells: 0,
    maxWater: 0, avgWater: 0, affectedArea: 0, affectedPopulation: 0,
    maxDepth: 0, predictedCriticalCount: 0, earliestCriticalTime: null,
  };
  const { safeCells, warningCells, criticalCells, maxWater, affectedPopulation } = stats;

  const hasCritical = criticalCells > 0;
  const hasWarning  = warningCells  > 0;

  /* ── 1. Safe Sectors ─────────────────────────────────────────────────────── */
  const safeIsAll = safeCells === totalCells;

  /* ── 2. Warning tile styles ─────────────────────────────────────────────── */
  const warnActive = hasWarning ? {
    background: 'var(--status-warn-subtle)',
    border:     '1px solid var(--status-warn-border)',
  } : {
    background: 'var(--bg-surface)',
    border:     '1px solid var(--border-subtle)',
  };

  /* ── 3. Critical tile styles ─────────────────────────────────────────────── */
  const critActive = hasCritical ? {
    background: 'var(--status-crit-subtle)',
    border:     '1px solid var(--status-crit-border)',
  } : {
    background: 'var(--bg-surface)',
    border:     '1px solid var(--border-subtle)',
  };

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2.5">

      {/* ── 1. Safe Sectors ───────────────────────────────────────────────── */}
      <div
        style={{
          ...chipBase,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Left accent strip — always shown in safe color */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--status-safe)', borderRadius: '1rem 0 0 1rem' }} />

        <div className="flex items-center justify-between" style={{ paddingLeft: '0.5rem' }}>
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--status-safe)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--status-safe)' }} />
            Safe Sectors
          </span>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>&lt; 0.15m</span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: safeIsAll ? 'var(--status-safe)' : 'var(--text-primary)', paddingLeft: '0.5rem' }}>
          <AnimatedCounter value={safeCells} />
          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>/ {totalCells}</span>
        </div>

        <div className="text-xs" style={{ color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
          {safeIsAll ? 'All sectors — nominal drainage' : 'Nominal drainage & absorption'}
        </div>
      </div>

      {/* ── 2. Warning Sectors ───────────────────────────────────────────── */}
      <div style={{ ...chipBase, ...warnActive }}>
        {/* Left strip: full opacity when active, faint when zero */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
          background: hasWarning ? 'var(--status-warn)' : 'var(--status-warn-border)',
          borderRadius: '1rem 0 0 1rem',
        }} />

        <div className="flex items-center justify-between" style={{ paddingLeft: '0.5rem' }}>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ color: hasWarning ? 'var(--status-warn)' : 'var(--text-muted)' }}
          >
            {hasWarning && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--status-warn)' }} />}
            Warning
          </span>
          <span className="text-xs" style={{ color: hasWarning ? 'var(--status-warn)' : 'var(--text-faint)', opacity: 0.8 }}>0.15–0.30m</span>
        </div>

        <div
          className="text-2xl sm:text-3xl font-bold tabular-nums"
          style={{ color: hasWarning ? 'var(--status-warn)' : 'var(--text-muted)', paddingLeft: '0.5rem' }}
        >
          <AnimatedCounter value={warningCells} />
          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
            {hasWarning ? 'sectors' : '/ no ponding'}
          </span>
        </div>

        <div className="text-xs" style={{ color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
          {hasWarning ? 'Ponding exceeding absorption rate' : 'No elevated ponding detected'}
        </div>
      </div>

      {/* ── 3. Critical Breach ───────────────────────────────────────────── */}
      <div
        className={hasCritical ? 'pulse-critical' : ''}
        style={{ ...chipBase, ...critActive }}
      >
        {/* Left strip: pulsing red when active, ghost when zero */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
          background: hasCritical ? 'var(--status-crit)' : 'var(--status-crit-border)',
          borderRadius: '1rem 0 0 1rem',
        }} />

        <div className="flex items-center justify-between" style={{ paddingLeft: '0.5rem' }}>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ color: hasCritical ? 'var(--status-crit)' : 'var(--text-muted)' }}
          >
            {hasCritical && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ background: 'var(--status-crit)' }}
              />
            )}
            Critical
          </span>
          <span className="text-xs" style={{ color: hasCritical ? 'var(--status-crit)' : 'var(--text-faint)', opacity: 0.8 }}>&ge; 0.30m</span>
        </div>

        <div
          className="text-2xl sm:text-3xl font-bold tabular-nums"
          style={{ color: hasCritical ? 'var(--status-crit)' : 'var(--text-muted)', paddingLeft: '0.5rem' }}
        >
          <AnimatedCounter value={criticalCells} />
          <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
            {hasCritical ? 'flooded' : '/ no breach'}
          </span>
        </div>

        <div className="text-xs" style={{ color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
          {hasCritical ? '⚠ Evacuation thresholds breached' : 'No critical breaches detected'}
        </div>
      </div>

      {/* ── 4. At-Risk Citizens + Peak Depth ─────────────────────────────── */}
      <div
        style={{
          ...chipBase,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--accent)', borderRadius: '1rem 0 0 1rem' }} />

        <div className="flex items-center justify-between" style={{ paddingLeft: '0.5rem' }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            At-Risk
          </span>
          <span className="text-xs font-mono font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {maxWater.toFixed(2)}m peak
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)', paddingLeft: '0.5rem' }}>
          <AnimatedCounter value={affectedPopulation} />
        </div>

        <div className="text-xs" style={{ color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
          Residents across Warning + Critical zones
        </div>
      </div>

    </div>
  );
};
