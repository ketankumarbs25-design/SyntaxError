/**
 * FLOWSHIELD — LiveStats
 *
 * Tactical HUD Telemetry Cards displaying real-time risk classification:
 * - Safe Zones (< 0.15m)
 * - Warning Zones (0.15m – 0.30m)
 * - Critical Inundation Zones (>= 0.30m) with alert pulse
 * - Peak Water Depth (m)
 * - Total Affected Population (Counting Warning + Critical sectors)
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

export const LiveStats: React.FC<LiveStatsProps> = ({ stats: statsProp, totalCells }) => {
  const stats = statsProp ?? {
    safeCells: 0, warningCells: 0, criticalCells: 0,
    maxWater: 0, avgWater: 0, affectedArea: 0, affectedPopulation: 0,
    maxDepth: 0, predictedCriticalCount: 0, earliestCriticalTime: null,
  };
  const {
    safeCells,
    warningCells,
    criticalCells,
    maxWater,
    affectedPopulation,
  } = stats;

  const hasCritical = criticalCells > 0;

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Safe Zones (<0.15m) */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Safe Sectors
          </span>
          <span className="text-[10px] text-emerald-500/80 font-normal">&lt; 0.15m</span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
          <AnimatedCounter value={safeCells} />
          <span className="text-xs font-normal text-emerald-500/80 ml-1">/ {totalCells}</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-sans">
          Nominal drainage &amp; absorption
        </div>
      </div>

      {/* 2. Warning Zones (0.15m - 0.30m) */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Warning
          </span>
          <span className="text-[10px] text-amber-500/80 font-normal">0.15–0.30m</span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
          <AnimatedCounter value={warningCells} />
          <span className="text-xs font-normal text-amber-500/80 ml-1">sectors</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-sans">
          Ponding exceeding absorption rate
        </div>
      </div>

      {/* 3. Critical Zones (>= 0.30m) */}
      <div
        className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-lg ${
          hasCritical
            ? 'bg-red-500/15 border-red-500/60 shadow-red-500/20 pulse-critical'
            : 'bg-red-500/5 border-red-500/20'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-red-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full bg-red-400 ${hasCritical ? 'animate-ping' : ''}`} />
            Critical Breach
          </span>
          <span className="text-[10px] text-red-500/80 font-normal">&ge; 0.30m</span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold text-red-400 font-mono">
          <AnimatedCounter value={criticalCells} />
          <span className="text-xs font-normal text-red-500/80 ml-1">flooded</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-sans">
          {hasCritical ? '🚨 Evacuation thresholds breached' : 'No critical breaches detected'}
        </div>
      </div>

      {/* 4. Affected Population (Warning + Critical) & Peak Depth */}
      <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
          <span className="font-bold uppercase tracking-wider">At-Risk Citizens</span>
          <span className="text-[10px] text-cyan-300 font-bold tabular-nums">
            {maxWater.toFixed(2)}m peak
          </span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-bold text-cyan-300 font-mono">
          <AnimatedCounter value={affectedPopulation} />
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-sans">
          Inhabitants across Warning + Critical zones
        </div>
      </div>
    </div>
  );
};
