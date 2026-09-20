/**
 * FLOWSHIELD — Charts
 *
 * All series colors reference CSS design tokens (resolved at runtime via JS constants).
 * Grid/axis/tooltip chrome colors use token variables.
 * SVG linearGradient stopColors use the same JS token constants for consistency.
 *
 * Gradient classification:
 *   - linearGradient#maxWaterGrad  FUNCTIONAL (under-area fill for water level chart)
 *   - linearGradient#critGrad      FUNCTIONAL (under-area fill for flood count chart)
 *   - Area/Line series colors       FUNCTIONAL (data encoding)
 * → None removed; series hex values updated to match design tokens.
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import type { SimState } from '../../sim/types';

/* ── Token constants (resolved once; Recharts accepts strings, not CSS vars) ─ */
const T = {
  bgBase:       '#0D0E15',  // --bg-base
  bgElevated:   '#1F2135',  // --bg-elevated
  borderStrong: '#292D48',  // --border-strong
  textMuted:    '#5C6485',  // --text-muted
  textPrimary:  '#EDF0F8',  // --text-primary
  accent:       '#627AEB',  // --accent
  safe:         '#38B27A',  // --status-safe
  warn:         '#CB8C35',  // --status-warn
  crit:         '#D64F4F',  // --status-crit
  // Secondary chart series — no purple token; kept as closest reasonable choice
  secondary:    '#8B8FD4',  // desaturated indigo, blends with accent palette
};

interface ChartsProps {
  timeline: SimState[];
  currentStep: number;
  rainfallIntensity: number;
  rainfallDuration: number;
  onSeek?: (step: number) => void;
}

export const Charts: React.FC<ChartsProps> = ({
  timeline,
  currentStep,
  rainfallIntensity,
  rainfallDuration,
  onSeek,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'risk' | 'stacked' | 'hyetograph'>('levels');

  const chartData = useMemo(() => {
    return timeline.map((state) => {
      const isRaining = state.time < rainfallDuration;
      return {
        step: state.step,
        time: state.time,
        maxWater: Number(state.stats.maxWater.toFixed(3)),
        avgWater: Number(state.stats.avgWater.toFixed(3)),
        criticalCount: state.stats.criticalCells,
        warningCount: state.stats.warningCells,
        safeCount: state.stats.safeCells,
        affectedArea: state.stats.affectedArea,
        rainMmHr: isRaining ? rainfallIntensity : 0,
      };
    });
  }, [timeline, rainfallIntensity, rainfallDuration]);

  const currentTime = timeline[currentStep]?.time ?? 0;

  const tabs = [
    { key: 'levels' as const, label: '💧 Water Levels' },
    { key: 'stacked' as const, label: '📊 Risk Zones' },
    { key: 'risk' as const, label: '🔴 Flood Count' },
    { key: 'hyetograph' as const, label: '🌧️ Rainfall' },
  ];

  /* Shared Recharts props — token-driven */
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: T.bgBase,
      borderColor: T.borderStrong,
      borderRadius: '12px',
      fontSize: '12px',
      color: T.textPrimary,
    },
  };

  return (
    <div
      className="w-full rounded-2xl p-4 shadow-sm flex flex-col"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header + Tabs */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 pb-3"
        style={{ borderBottom: '1px solid var(--border-strong)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Flood Analysis</h3>
        </div>

        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-2.5 py-1 rounded-lg text-xs transition-all"
              style={
                activeTab === key
                  ? { background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', fontWeight: 600 }
                  : { color: 'var(--text-muted)', border: '1px solid transparent', background: 'transparent' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-56 mt-3 text-[10px]">
        {activeTab === 'levels' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(e) => e?.activeLabel !== undefined && onSeek?.(Number(e.activeLabel))}>
              <defs>
                {/* FUNCTIONAL gradient — area fill under water depth series */}
                <linearGradient id="maxWaterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.accent} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bgElevated} opacity={0.8} />
              <XAxis dataKey="time" stroke={T.textMuted} unit="m" tickLine={false} />
              <YAxis stroke={T.textMuted} unit="m" tickLine={false} domain={[0, 'auto']} />
              <Tooltip {...tooltipStyle} labelFormatter={(label) => `Minute ${label}`} />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke={T.crit} strokeDasharray="2 2" label={{ value: 'Now', fill: T.crit, fontSize: 11 }} />
              <Area type="monotone" dataKey="maxWater" name="Deepest Water" stroke={T.accent} strokeWidth={2} fill="url(#maxWaterGrad)" />
              <Line type="monotone" dataKey="avgWater" name="Average Depth" stroke={T.secondary} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'stacked' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(e) => e?.activeLabel !== undefined && onSeek?.(Number(e.activeLabel))}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bgElevated} opacity={0.8} />
              <XAxis dataKey="time" stroke={T.textMuted} unit="m" tickLine={false} />
              <YAxis stroke={T.textMuted} tickLine={false} />
              <Tooltip {...tooltipStyle} labelFormatter={(label) => `Minute ${label}`} />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke={T.textPrimary} strokeDasharray="2 2" />
              {/* FUNCTIONAL stacked areas — data encoding for sector risk counts */}
              <Area type="monotone" stackId="1" dataKey="criticalCount" name="Flooding"  stroke={T.crit} fill={T.crit} fillOpacity={0.65} />
              <Area type="monotone" stackId="1" dataKey="warningCount"  name="At Risk"   stroke={T.warn} fill={T.warn} fillOpacity={0.65} />
              <Area type="monotone" stackId="1" dataKey="safeCount"     name="Safe"      stroke={T.safe} fill={T.safe} fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'risk' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(e) => e?.activeLabel !== undefined && onSeek?.(Number(e.activeLabel))}>
              <defs>
                {/* FUNCTIONAL gradient — area fill under critical zone count */}
                <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.crit} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={T.crit} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bgElevated} opacity={0.8} />
              <XAxis dataKey="time" stroke={T.textMuted} unit="m" tickLine={false} />
              <YAxis stroke={T.textMuted} tickLine={false} />
              <Tooltip {...tooltipStyle} labelFormatter={(label) => `Minute ${label}`} />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke={T.textPrimary} strokeDasharray="2 2" />
              <Area type="monotone" dataKey="criticalCount" name="Flooding Zones" stroke={T.crit} strokeWidth={2} fill="url(#critGrad)" />
              <Line type="monotone" dataKey="affectedArea"  name="Total At Risk"  stroke={T.warn} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'hyetograph' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(e) => e?.activeLabel !== undefined && onSeek?.(Number(e.activeLabel))}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bgElevated} opacity={0.8} />
              <XAxis dataKey="time" stroke={T.textMuted} unit="m" tickLine={false} />
              {/* FUNCTIONAL axis labels — rain uses accent, depth uses status-crit */}
              <YAxis yAxisId="rain"  orientation="left"  stroke={T.accent} unit="mm" tickLine={false} />
              <YAxis yAxisId="depth" orientation="right" stroke={T.crit}   unit="m"  tickLine={false} />
              <Tooltip {...tooltipStyle} labelFormatter={(label) => `Minute ${label}`} />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke={T.textPrimary} strokeDasharray="2 2" />
              {/* FUNCTIONAL areas — rain intensity & peak water depth are data encodings */}
              <Area yAxisId="rain"  type="stepAfter" dataKey="rainMmHr"  name="Rain (mm/hr)"       stroke={T.accent} fill={T.accent} fillOpacity={0.2} />
              <Line yAxisId="depth" type="monotone"  dataKey="maxWater"  name="Deepest Water (m)"  stroke={T.crit}   strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
