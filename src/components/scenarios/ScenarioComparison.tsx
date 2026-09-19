/**
 * FLOWSHIELD — ScenarioComparison
 *
 * Headless multi-scenario comparison (Normal 20 / Heavy 80 / Extreme 160 mm/hr).
 * STRICT ANIMATION COMPLIANCE:
 * - Scenario comparison bars grow on mount via Motion
 * - Compares: peak water level, critical cell count, time-to-first-critical, and affected area
 */

import React from 'react';
import { motion } from 'motion/react';
import type { ScenariosSummary } from '../../worker/simWorker';

interface ScenarioComparisonProps {
  scenarios: ScenariosSummary | null;
  isLoading?: boolean;
  onApplyPreset?: (intensity: number) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  isLoading = false,
  onApplyPreset,
}) => {
  if (isLoading || !scenarios) {
    return (
      <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <h3 className="font-telemetry font-bold text-xs uppercase tracking-wider text-slate-200">
            Headless Scenario Engine
          </h3>
        </div>
        <div className="h-36 flex items-center justify-center text-xs font-telemetry text-slate-500">
          Running Monte Carlo scenarios in background worker...
        </div>
      </div>
    );
  }

  const { normal, heavy, extreme } = scenarios;
  const items = [normal, heavy, extreme];

  const maxPeakLevel = Math.max(...items.map((s) => s.peakLevel), 0.01);
  const maxCrit = Math.max(...items.map((s) => s.maxCriticalCount), 1);
  const maxArea = Math.max(...items.map((s) => s.peakAffectedArea), 1);

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 shadow-xl flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <h3 className="font-telemetry font-bold text-xs uppercase tracking-wider text-slate-200">
            Headless Scenario Stress Test
          </h3>
        </div>
        <span className="text-[10px] font-telemetry text-slate-500">
          Worker Precomputed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        {items.map((item) => {
          const isExtreme = item.name === 'Extreme';
          const isHeavy = item.name === 'Heavy';

          const themeColor = isExtreme ? '#ef4444' : isHeavy ? '#f59e0b' : '#06b6d4';
          const bgGradient = isExtreme
            ? 'from-red-950/40 to-slate-900/40 border-red-900/50'
            : isHeavy
            ? 'from-amber-950/30 to-slate-900/40 border-amber-900/50'
            : 'from-cyan-950/30 to-slate-900/40 border-cyan-900/50';

          const peakPct = (item.peakLevel / maxPeakLevel) * 100;
          const critPct = (item.maxCriticalCount / maxCrit) * 100;
          const areaPct = (item.peakAffectedArea / maxArea) * 100;

          return (
            <div
              key={item.name}
              className={`p-2.5 rounded-lg border bg-gradient-to-b ${bgGradient} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-telemetry font-bold text-xs text-white">
                    {item.name} ({item.rainfallIntensity} mm/h)
                  </span>
                  <button
                    onClick={() => onApplyPreset?.(item.rainfallIntensity)}
                    className="text-[9px] font-telemetry px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                  >
                    Load
                  </button>
                </div>

                {/* Metric 1: Peak Water Depth */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] font-telemetry text-slate-400">
                    <span>Peak Depth</span>
                    <span className="font-bold text-white">{item.peakLevel.toFixed(2)}m</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${peakPct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>
                </div>

                {/* Metric 2: Max Critical Inundation */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] font-telemetry text-slate-400">
                    <span>Critical Zones</span>
                    <span className="font-bold text-white">{item.maxCriticalCount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${critPct}%` }}
                      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>
                </div>

                {/* Metric 3: Peak Affected Area */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] font-telemetry text-slate-400">
                    <span>Affected Grid</span>
                    <span className="font-bold text-white">{item.peakAffectedArea}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${areaPct}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Time to First Critical */}
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-telemetry">
                <span className="text-slate-400">First Inundation:</span>
                <span className="font-bold text-slate-200">
                  {item.timeToFirstCritical !== null ? `t = ${item.timeToFirstCritical} min` : 'None'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
