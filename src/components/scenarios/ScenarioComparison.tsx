/**
 * FLOWSHIELD — ScenarioComparison
 *
 * 4-Way Tactical Scenario Comparison Matrix:
 * 1. Normal Rain (20 mm/hr, 100% drainage)
 * 2. Heavy Rain (80 mm/hr, 100% drainage)
 * 3. Drainage Failure (80 mm/hr, 20% drainage)
 * 4. Blocked Channel (80 mm/hr, valley channel obstructed)
 *
 * Visual comparative bars for Peak Depth, Critical Cells, Time to Critical, and Affected Population.
 * 1-click "Deploy Scenario" action.
 */

import React from 'react';
import { motion } from 'motion/react';
import type { ScenariosSummary, ScenarioResult } from '../../worker/simWorker';

interface ScenarioComparisonProps {
  scenarios: ScenariosSummary | null;
  isLoading?: boolean;
  onApplyScenario?: (scenario: ScenarioResult) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  isLoading = false,
  onApplyScenario,
}) => {
  if (isLoading || !scenarios) {
    return (
      <div className="w-full bg-[#0a101f]/90 border border-[#17243b] rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            Synthesizing 4-Scenario Comparative Matrix...
          </h3>
        </div>
        <div className="h-28 flex items-center justify-center text-xs font-mono text-slate-500">
          Computing multi-scenario hydrodynamic convergence in Web Worker...
        </div>
      </div>
      </div>
    );
  }

  const items: Array<ScenarioResult & {
    emoji: string;
    tag: string;
    border: string;
    accent: string;
    barColor: string;
  }> = [
    {
      ...scenarios.normal,
      emoji: '☀️',
      tag: 'BASELINE',
      border: 'border-emerald-500/30',
      accent: 'text-emerald-400',
      barColor: '#10b981',
    },
    {
      ...scenarios.heavy,
      emoji: '🌧️',
      tag: 'STORM SURGE',
      border: 'border-amber-500/30',
      accent: 'text-amber-400',
      barColor: '#f59e0b',
    },
    {
      ...scenarios.failure,
      emoji: '⚠️',
      tag: 'SYSTEM COMPROMISE',
      border: 'border-orange-500/30',
      accent: 'text-orange-400',
      barColor: '#ea580c',
    },
    {
      ...scenarios.blocked,
      emoji: '🚧',
      tag: 'OUTLET CHOKE',
      border: 'border-red-500/40',
      accent: 'text-red-400',
      barColor: '#ef4444',
    },
  ];

  const maxPeakLevel = Math.max(...items.map((s) => s.peakLevel), 0.1);
  const maxCrit = Math.max(...items.map((s) => s.maxCriticalCount), 1);
  const maxPop = Math.max(...items.map((s) => s.peakAffectedPopulation), 100);

  return (
    <div className="w-full bg-[#0a101f]/90 border border-[#17243b] rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base text-cyan-400">⚡</span>
          <div>
            <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
              Scenario Comparative Matrix
            </h3>
            <div className="text-[10px] text-slate-400 font-mono">
              Stress-test 4 hydrological conditions side-by-side
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          4 Scenarios Computed
        </span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((scenario) => {
          const peakPct = (scenario.peakLevel / maxPeakLevel) * 100;
          const critPct = (scenario.maxCriticalCount / maxCrit) * 100;
          const popPct = (scenario.peakAffectedPopulation / maxPop) * 100;

          return (
            <div
              key={scenario.name}
              className={`p-3.5 rounded-xl border bg-slate-950/70 ${scenario.border} flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {scenario.tag}
                  </span>
                  <button
                    onClick={() => onApplyScenario?.(scenario)}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-colors"
                  >
                    Deploy
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-base">{scenario.emoji}</span>
                  <h4 className="font-mono font-bold text-xs text-white">
                    {scenario.name}
                  </h4>
                </div>

                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {scenario.rainfallIntensity} mm/hr • {(scenario.drainageEfficiency * 100).toFixed(0)}% Drain
                </div>
              </div>

              {/* Comparative Visual Metrics */}
              <div className="space-y-2.5 font-mono text-[11px] pt-2 border-t border-slate-900">
                {/* 1. Peak Water Depth */}
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Peak Depth:</span>
                    <span className="font-bold text-white tabular-nums">
                      {scenario.peakLevel.toFixed(2)} m
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${peakPct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: scenario.barColor }}
                    />
                  </div>
                </div>

                {/* 2. Critical Cells Count */}
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Critical Cells:</span>
                    <span className={`font-bold tabular-nums ${scenario.maxCriticalCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {scenario.maxCriticalCount} / 64
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${critPct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-red-500"
                    />
                  </div>
                </div>

                {/* 3. Affected Population */}
                <div>
                  <div className="flex justify-between text-slate-400">
                    <span>Affected Pop:</span>
                    <span className="font-bold text-cyan-300 tabular-nums">
                      {scenario.peakAffectedPopulation.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${popPct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-cyan-400"
                    />
                  </div>
                </div>

                {/* 4. Time to First Critical */}
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-900">
                  <span>Time to Crit:</span>
                  <span className="font-bold text-amber-300 tabular-nums">
                    {scenario.timeToFirstCritical !== null
                      ? `~${scenario.timeToFirstCritical.toFixed(0)} min`
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
