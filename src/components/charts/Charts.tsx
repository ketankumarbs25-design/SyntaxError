/**
 * FLOWSHIELD — Charts (Simplified)
 *
 * Clean charts with simple labels.
 * Default view: Water Levels. Tabs for Risk Distribution, Critical Zones, Rainfall.
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

  return (
    <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 shadow-xl flex flex-col">
      {/* Header + Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <h3 className="font-semibold text-sm text-white">Flood Analysis</h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/30">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                activeTab === key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
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
                <linearGradient id="maxWaterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748b" unit="m" tickLine={false} />
              <YAxis stroke="#64748b" unit="m" tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                labelFormatter={(label) => `Minute ${label}`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: 'Now', fill: '#f43f5e', fontSize: 11 }} />
              <Area type="monotone" dataKey="maxWater" name="Deepest Water" stroke="#00e5ff" strokeWidth={2} fill="url(#maxWaterGrad)" />
              <Line type="monotone" dataKey="avgWater" name="Average Depth" stroke="#a78bfa" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'stacked' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(e) => e?.activeLabel !== undefined && onSeek?.(Number(e.activeLabel))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748b" unit="m" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                labelFormatter={(label) => `Minute ${label}`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#ffffff" strokeDasharray="2 2" />
              <Area type="monotone" stackId="1" dataKey="criticalCount" name="Flooding" stroke="#ef4444" fill="#ef4444" fillOpacity={0.7} />
              <Area type="monotone" stackId="1" dataKey="warningCount" name="At Risk" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} />
              <Area type="monotone" stackId="1" dataKey="safeCount" name="Safe" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'risk' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(e) => e?.activeLabel !== undefined && onSeek?.(Number(e.activeLabel))}>
              <defs>
                <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748b" unit="m" tickLine={false} />
              <YAxis stroke="#64748b" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                labelFormatter={(label) => `Minute ${label}`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#ffffff" strokeDasharray="2 2" />
              <Area type="monotone" dataKey="criticalCount" name="Flooding Zones" stroke="#ef4444" strokeWidth={2} fill="url(#critGrad)" />
              <Line type="monotone" dataKey="affectedArea" name="Total At Risk" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'hyetograph' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={(e) => e?.activeLabel !== undefined && onSeek?.(Number(e.activeLabel))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="time" stroke="#64748b" unit="m" tickLine={false} />
              <YAxis yAxisId="rain" orientation="left" stroke="#38bdf8" unit="mm" tickLine={false} />
              <YAxis yAxisId="depth" orientation="right" stroke="#f43f5e" unit="m" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                labelFormatter={(label) => `Minute ${label}`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#ffffff" strokeDasharray="2 2" />
              <Area yAxisId="rain" type="stepAfter" dataKey="rainMmHr" name="Rain (mm/hr)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
              <Line yAxisId="depth" type="monotone" dataKey="maxWater" name="Deepest Water (m)" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
