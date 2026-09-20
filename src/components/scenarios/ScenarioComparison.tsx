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
      <div
        className="w-full rounded-2xl p-4 shadow-sm"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="flex items-center gap-2 pb-3"
          style={{ borderBottom: '1px solid var(--border-strong)' }}
        >
          <span className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Synthesizing 4-Scenario Comparative Matrix...
          </h3>
        </div>
        <div className="h-28 flex items-center justify-center text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          Computing multi-scenario hydrodynamic convergence in Web Worker...
        </div>
      </div>
    );
  }

  // barColor = functional data encoding (maps to nearest design token)
  // NOTE: orange-600 (#ea580c) has no exact token. Mapped to #C2682B (between --status-warn and --status-crit).
  const items: Array<ScenarioResult & {
    emoji: string;
    tag: string;
    borderToken: string;
    accentToken: string;
    barColor: string;
  }> = [
    {
      ...scenarios.normal,
      emoji: '\u2600\ufe0f',
      tag: 'BASELINE',
      borderToken: 'var(--status-safe-border)',
      accentToken: 'var(--status-safe)',
      barColor: '#38B27A',   /* --status-safe */
    },
    {
      ...scenarios.heavy,
      emoji: '\ud83c\udf27\ufe0f',
      tag: 'STORM SURGE',
      borderToken: 'var(--status-warn-border)',
      accentToken: 'var(--status-warn)',
      barColor: '#CB8C35',   /* --status-warn */
    },
    {
      ...scenarios.failure,
      emoji: '\u26a0\ufe0f',
      tag: 'SYSTEM COMPROMISE',
      borderToken: 'rgba(194, 104, 43, 0.28)',  /* midpoint warn→crit, no token */
      accentToken: '#C2682B',
      barColor: '#C2682B',   /* ⚠ flagged: no orange token; between warn and crit */
    },
    {
      ...scenarios.blocked,
      emoji: '\ud83d\udea7',
      tag: 'OUTLET CHOKE',
      borderToken: 'var(--status-crit-border)',
      accentToken: 'var(--status-crit)',
      barColor: '#D64F4F',   /* --status-crit */
    },
  ];

  const maxPeakLevel = Math.max(...items.map((s) => s.peakLevel), 0.1);
  const maxCrit = Math.max(...items.map((s) => s.maxCriticalCount), 1);
  const maxPop = Math.max(...items.map((s) => s.peakAffectedPopulation), 100);

  return (
    <div
      className="w-full rounded-2xl p-4 shadow-sm flex flex-col gap-3"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: '1px solid var(--border-strong)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">&#9889;</span>
          <div>
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Scenario Comparative Matrix
            </h3>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Stress-test 4 hydrological conditions side-by-side
            </div>
          </div>
        </div>

        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded"
          style={{ color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
        >
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
              className="p-3.5 rounded-xl flex flex-col justify-between gap-3 shadow-sm relative overflow-hidden"
              style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${scenario.borderToken}`,
              }}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}
                  >
                    {scenario.tag}
                  </span>
                  <button
                    onClick={() => onApplyScenario?.(scenario)}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg transition-colors"
                    style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                  >
                    Deploy
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-base">{scenario.emoji}</span>
                  <h4 className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {scenario.name}
                  </h4>
                </div>

                <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {scenario.rainfallIntensity} mm/hr • {(scenario.drainageEfficiency * 100).toFixed(0)}% Drain
                </div>
              </div>

              {/* Comparative Visual Metrics */}
              <div
                className="space-y-2.5 font-mono text-[11px] pt-2"
                style={{ borderTop: '1px solid var(--border-strong)' }}
              >
                {/* 1. Peak Water Depth */}
                <div>
                  <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>Peak Depth:</span>
                    <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {scenario.peakLevel.toFixed(2)} m
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
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
                  <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>Critical Cells:</span>
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: scenario.maxCriticalCount > 0 ? 'var(--status-crit)' : 'var(--status-safe)' }}
                    >
                      {scenario.maxCriticalCount} / 64
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${critPct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--status-crit)' }}
                    />
                  </div>
                </div>

                {/* 3. Affected Population */}
                <div>
                  <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>Affected Pop:</span>
                    <span className="font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
                      {scenario.peakAffectedPopulation.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${popPct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  </div>
                </div>

                {/* 4. Time to First Critical */}
                <div
                  className="flex justify-between pt-1"
                  style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-strong)' }}
                >
                  <span>Time to Crit:</span>
                  <span className="font-bold tabular-nums" style={{ color: 'var(--status-warn)' }}>
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
