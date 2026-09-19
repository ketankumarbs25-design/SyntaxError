/**
 * FLOWSHIELD — Charts Panel
 *
 * Implements 4 analytical hydrological charts using Recharts:
 * 1. Water Level vs Time (Max + Mean water depth)
 * 2. Critical Region Count vs Time
 * 3. Stacked Risk Evolution (Safe / Warning / Critical cell distribution)
 * 4. Rainfall Hyetograph vs Peak Hydrostatic Response
 *
 * Includes synchronized cursor tracking with current playback timestep.
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

  // Downsample data if timeline is very long for ultra-smooth rendering
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

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 shadow-xl flex flex-col">
      {/* Header with Chart View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <h3 className="font-telemetry font-bold text-xs uppercase tracking-wider text-slate-200">
            Hydrological Telemetry
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] font-telemetry">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'levels'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Depth (Max/Mean)
          </button>
          <button
            onClick={() => setActiveTab('stacked')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'stacked'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk Distribution
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'risk'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical Zones
          </button>
          <button
            onClick={() => setActiveTab('hyetograph')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'hyetograph'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rainfall vs Peak
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-52 mt-2 font-telemetry text-[10px]">
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
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                labelFormatter={(label) => `t = ${label} min`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: 'NOW', fill: '#f43f5e', fontSize: 10 }} />
              <Area type="monotone" dataKey="maxWater" name="Peak Depth" stroke="#00e5ff" strokeWidth={2} fill="url(#maxWaterGrad)" />
              <Line type="monotone" dataKey="avgWater" name="Mean Depth" stroke="#a78bfa" strokeWidth={1.5} dot={false} />
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
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                labelFormatter={(label) => `t = ${label} min`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#ffffff" strokeDasharray="2 2" />
              <Area type="monotone" stackId="1" dataKey="criticalCount" name="Critical" stroke="#ef4444" fill="#ef4444" fillOpacity={0.7} />
              <Area type="monotone" stackId="1" dataKey="warningCount" name="Warning" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} />
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
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                labelFormatter={(label) => `t = ${label} min`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#ffffff" strokeDasharray="2 2" />
              <Area type="monotone" dataKey="criticalCount" name="Critical Inundation Count" stroke="#ef4444" strokeWidth={2} fill="url(#critGrad)" />
              <Line type="monotone" dataKey="affectedArea" name="Total Affected Zones" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
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
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                labelFormatter={(label) => `t = ${label} min`}
              />
              <Legend verticalAlign="top" height={24} />
              <ReferenceLine x={currentTime} stroke="#ffffff" strokeDasharray="2 2" />
              <Area yAxisId="rain" type="stepAfter" dataKey="rainMmHr" name="Rainfall Rate (mm/hr)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
              <Line yAxisId="depth" type="monotone" dataKey="maxWater" name="Peak Depth Response (m)" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
