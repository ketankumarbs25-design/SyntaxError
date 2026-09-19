/**
 * FLOWSHIELD — LiveStats (Simplified)
 *
 * Big, clear stat cards with emoji icons.
 * No jargon — just numbers that make sense at a glance.
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
  const spring = useSpring(value, { stiffness: 160, damping: 24 });
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

export const LiveStats: React.FC<LiveStatsProps> = ({ stats, totalCells }) => {
  const {
    safeCells,
    warningCells,
    criticalCells,
    maxWater,
    avgWater,
    affectedArea,
    affectedPopulation,
    predictedCriticalCount,
    earliestCriticalTime,
  } = stats;

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {/* Safe Zones */}
      <div className="p-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400/80">
          <span>🟢</span>
          <span>Safe Zones</span>
        </div>
        <div className="mt-1.5 text-2xl font-bold text-emerald-400">
          <AnimatedCounter value={safeCells} />
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          of {totalCells} total zones
        </div>
      </div>

      {/* At Risk */}
      <div className="p-3 rounded-2xl bg-amber-500/8 border border-amber-500/20 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
          <span>🟡</span>
          <span>At Risk</span>
        </div>
        <div className="mt-1.5 text-2xl font-bold text-amber-400">
          <AnimatedCounter value={warningCells} />
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          water rising
        </div>
      </div>

      {/* Flooding */}
      <div className="p-3 rounded-2xl bg-red-500/8 border border-red-500/20 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-red-400/80">
          <span>🔴</span>
          <span>Flooding</span>
        </div>
        <div className="mt-1.5 text-2xl font-bold text-red-400">
          <AnimatedCounter value={criticalCells} />
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {criticalCells > 0 ? 'zones underwater' : 'all clear'}
        </div>
      </div>

      {/* People Affected */}
      <div className="p-3 rounded-2xl bg-slate-500/8 border border-slate-600/20 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>👥</span>
          <span>People Affected</span>
        </div>
        <div className="mt-1.5 text-2xl font-bold text-white">
          <AnimatedCounter value={affectedPopulation} />
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {affectedArea > 0 ? `in ${affectedArea} zones` : 'nobody at risk'}
        </div>
      </div>

      {/* Deepest Water */}
      <div className="p-3 rounded-2xl bg-cyan-500/8 border border-cyan-500/20 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-cyan-400/80">
          <span>💧</span>
          <span>Deepest Water</span>
        </div>
        <div className="mt-1.5 text-2xl font-bold text-cyan-400">
          <AnimatedCounter value={maxWater} decimals={2} suffix="m" />
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          avg <AnimatedCounter value={avgWater} decimals={2} suffix="m" />
        </div>
      </div>

      {/* Predictions */}
      <div className="p-3 rounded-2xl bg-purple-500/8 border border-purple-500/20 flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-purple-400/80">
          <span>🔮</span>
          <span>Prediction</span>
        </div>
        <div className="mt-1.5 text-lg font-bold text-purple-300">
          {criticalCells > 0 ? (
            <span className="text-red-400">⚠️ Active Flood</span>
          ) : earliestCriticalTime !== null ? (
            <span>
              ~<AnimatedCounter value={earliestCriticalTime} decimals={0} /> min
            </span>
          ) : (
            <span className="text-emerald-400 text-base">✅ No threat</span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {predictedCriticalCount > 0 ? `${predictedCriticalCount} zones may flood` : 'looking good'}
        </div>
      </div>

      {/* Total Water Depth */}
      <div className="sm:col-span-2 p-3 rounded-2xl bg-blue-500/8 border border-blue-500/20 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400/80">
            <span>🌊</span>
            <span>Overall Flood Status</span>
          </div>
          <div className="mt-1 text-sm text-slate-300">
            {criticalCells === 0 && warningCells === 0
              ? '✅ All zones safe — no flooding detected'
              : criticalCells > 0
              ? `🚨 ${criticalCells} zone${criticalCells > 1 ? 's' : ''} flooding, ${affectedPopulation.toLocaleString()} people affected`
              : `⚠️ ${warningCells} zone${warningCells > 1 ? 's' : ''} at risk — monitor closely`
            }
          </div>
        </div>
        <div className="text-3xl">
          {criticalCells > 0 ? '🌊' : warningCells > 0 ? '⚠️' : '☀️'}
        </div>
      </div>
    </div>
  );
};
