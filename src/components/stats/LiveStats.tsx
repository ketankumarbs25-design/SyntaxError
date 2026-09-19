/**
 * FLOWSHIELD — LiveStats
 *
 * Real-time tactical metrics with Motion spring-animated counters.
 * STRICT ANIMATION COMPLIANCE:
 * - Uses `useSpring` + `useTransform` from 'motion/react' for counters
 * - Prominently displays: risk counts, max/avg water, affected area,
 *   simulation estimated population, predicted-critical count, earliest critical time.
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
    <span ref={textRef} className="font-telemetry font-bold">
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
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* 1. Risk Counts */}
      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
        <div className="text-[10px] font-telemetry tracking-wider uppercase text-slate-400">
          Risk Overview
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-red-400 font-telemetry text-lg font-bold">
            <AnimatedCounter value={criticalCells} />
            <span className="text-[10px] text-red-500/80 font-normal ml-1">CRIT</span>
          </div>
          <div className="text-amber-400 font-telemetry text-sm font-semibold">
            <AnimatedCounter value={warningCells} />
            <span className="text-[9px] text-amber-500/80 font-normal ml-0.5">WARN</span>
          </div>
          <div className="text-emerald-400 font-telemetry text-sm font-semibold">
            <AnimatedCounter value={safeCells} />
            <span className="text-[9px] text-emerald-500/80 font-normal ml-0.5">SAFE</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-telemetry mt-0.5">
          {((affectedArea / totalCells) * 100).toFixed(0)}% grid at risk
        </div>
      </div>

      {/* 2. Water Depths (Max & Mean) */}
      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
        <div className="text-[10px] font-telemetry tracking-wider uppercase text-slate-400">
          Max / Avg Depth
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-cyan-400 font-telemetry text-lg font-bold">
            <AnimatedCounter value={maxWater} decimals={2} suffix="m" />
          </div>
          <div className="text-slate-400 font-telemetry text-xs">
            avg <AnimatedCounter value={avgWater} decimals={2} suffix="m" />
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-telemetry mt-0.5">
          hydrostatic peak
        </div>
      </div>

      {/* 3. Affected Population */}
      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-telemetry tracking-wider uppercase text-slate-400">
            Pop. Exposed
          </span>
          <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
            SIM ESTIMATE
          </span>
        </div>
        <div className="mt-1 text-white font-telemetry text-lg font-bold">
          <AnimatedCounter value={affectedPopulation} />
        </div>
        <div className="text-[10px] text-slate-400 font-telemetry mt-0.5">
          {affectedArea} zones (Warning+Critical)
        </div>
      </div>

      {/* 4. Early Inundation Prediction */}
      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
        <div className="text-[10px] font-telemetry tracking-wider uppercase text-slate-400">
          Earliest Critical
        </div>
        <div className="mt-1 text-amber-300 font-telemetry text-lg font-bold">
          {criticalCells > 0 ? (
            <span className="text-red-400">ACTIVE INUNDATION</span>
          ) : earliestCriticalTime !== null ? (
            <span>
              in <AnimatedCounter value={earliestCriticalTime} decimals={1} suffix="m" />
            </span>
          ) : (
            <span className="text-slate-500 font-normal text-sm">NO PROJECTED THREAT</span>
          )}
        </div>
        <div className="text-[10px] text-slate-500 font-telemetry mt-0.5">
          {predictedCriticalCount} cells rising to critical
        </div>
      </div>
    </div>
  );
};
