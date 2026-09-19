/**
 * FLOWSHIELD — ScenarioComparison (Simplified)
 *
 * Three clean cards comparing Light / Heavy / Extreme storms.
 * Simple labels, no jargon.
 */

import React from 'react';
import { motion } from 'motion/react';
import type { ScenariosSummary } from '../../worker/simWorker';
import { Loader } from '../kokonutui/loader';

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
      <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center">
        <Loader
          size="sm"
          title="Comparing Scenarios..."
          subtitle="Simulating Normal, Heavy & Extreme storms in Web Worker"
        />
      </div>
    );
  }

  const { normal, heavy, extreme } = scenarios;
  const items = [
    { ...normal, emoji: '☀️', gradient: 'from-cyan-500/8 to-slate-900/40', border: 'border-cyan-500/20', color: 'text-cyan-400', barColor: '#06b6d4' },
    { ...heavy, emoji: '🌧️', gradient: 'from-amber-500/8 to-slate-900/40', border: 'border-amber-500/20', color: 'text-amber-400', barColor: '#f59e0b' },
    { ...extreme, emoji: '⛈️', gradient: 'from-red-500/8 to-slate-900/40', border: 'border-red-500/20', color: 'text-red-400', barColor: '#ef4444' },
  ];

  const maxPeakLevel = Math.max(...items.map((s) => s.peakLevel), 0.01);
  const maxCrit = Math.max(...items.map((s) => s.maxCriticalCount), 1);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 shadow-xl flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <h3 className="font-semibold text-sm text-white">Storm Comparison</h3>
        </div>
        <span className="text-[11px] text-slate-500">What-if analysis</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        {items.map((item) => {
          const peakPct = (item.peakLevel / maxPeakLevel) * 100;
          const critPct = (item.maxCriticalCount / maxCrit) * 100;

          return (
            <div
              key={item.name}
              className={`p-3 rounded-xl border bg-gradient-to-b ${item.gradient} ${item.border} flex flex-col gap-3`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{item.emoji}</span>
                  <span>{item.name === 'Normal' ? 'Light Rain' : item.name === 'Heavy' ? 'Heavy Rain' : 'Extreme Storm'}</span>
                </span>
                <button
                  onClick={() => onApplyPreset?.(item.rainfallIntensity)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white/8 hover:bg-white/15 text-slate-300 transition-colors border border-white/10"
                >
                  Try it
                </button>
              </div>

              {/* Deepest Water */}
              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Deepest Water</span>
                  <span className="font-bold text-white">{item.peakLevel.toFixed(2)}m</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${peakPct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.barColor }}
                  />
                </div>
              </div>

              {/* Flooding Zones */}
              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Zones Flooded</span>
                  <span className="font-bold text-white">{item.maxCriticalCount}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${critPct}%` }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.barColor }}
                  />
                </div>
              </div>

              {/* First Flood Time */}
              <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs">
                <span className="text-slate-400">First flood at:</span>
                <span className="font-bold text-slate-200">
                  {item.timeToFirstCritical !== null ? `${item.timeToFirstCritical} min` : 'Never'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
