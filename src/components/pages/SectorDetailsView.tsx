import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { SectorLiveMetrics } from '../../lib/liveDataSource';

interface SectorDetailsViewProps {
  sector: SectorLiveMetrics;
  onBackToSectors: () => void;
}

export const SectorDetailsView: React.FC<SectorDetailsViewProps> = ({
  sector,
  onBackToSectors,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'culvert' | 'history'>('live');

  // Exact curve points matching Screenshot 4
  const chartData = [
    { time: '00:00', level: 0.26 },
    { time: '03:00', level: 0.28 },
    { time: '06:00', level: 0.36 },
    { time: '08:00', level: 0.22 },
    { time: '10:00', level: 0.31 },
    { time: '12:00', level: 0.48 },
    { time: '14:00', level: 0.38 },
    { time: '16:00', level: 0.44 },
    { time: '18:00', level: 0.54 },
    { time: '21:00', level: 0.31 },
    { time: '24:00', level: 0.30 },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Back to Sectors Link (exact match from Screenshot 4) */}
      <div>
        <button
          onClick={onBackToSectors}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1D4ED8] dark:text-blue-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sectors</span>
        </button>
      </div>

      {/* Header: Sector Title + Status Pill Badge + Subtitle */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1F38] dark:text-white tracking-tight">
            {sector.code ? `${sector.code} – ` : 'Sector A1 – '}{sector.name}
          </h1>

          {/* Safe Badge */}
          <span className="px-3 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/50 dark:text-emerald-300 border border-[#BBF7D0] dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            {sector.status}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed information and live data for this sector.
        </p>
      </div>

      {/* Top 2-Column Section: Culvert Photo & Stats Card (exact match from Screenshot 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Left: Culvert Real Photo */}
        <div className="rounded-2xl overflow-hidden aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-xs relative">
          <img
            src="/culvert_yelahanka.jpg"
            alt={`${sector.name} Culvert`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Right: Clean White Stats Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col justify-around space-y-4">
          {/* Current Water Level */}
          <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Current Water Level
            </span>
            <span className="font-extrabold text-[#0D1F38] dark:text-white text-sm sm:text-base">
              0.12 m
            </span>
          </div>

          {/* Culvert Capacity */}
          <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Culvert Capacity
            </span>
            <span className="font-extrabold text-[#0D1F38] dark:text-white text-sm sm:text-base">
              2.5 m
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Status
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#16A34A] text-white">
              Safe
            </span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Last Updated
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              2 min ago
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: [ Live Data ]  [ Culvert Info ]  [ History ] (exact match from Screenshot 4) */}
      <div className="grid grid-cols-3 gap-2 bg-white/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveTab('live')}
          className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'live'
              ? 'bg-[#EBF3FE] dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Live Data
        </button>

        <button
          onClick={() => setActiveTab('culvert')}
          className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'culvert'
              ? 'bg-[#EBF3FE] dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Culvert Info
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center ${
            activeTab === 'history'
              ? 'bg-[#EBF3FE] dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {/* Chart Card: Water Level (Last 24 Hours) (exact match from Screenshot 4) */}
      {activeTab === 'live' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Water Level (Last 24 Hours)
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span>Normal Range</span>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="normalRangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                  opacity={0.7}
                />
                <XAxis
                  dataKey="time"
                  ticks={['00:00', '06:00', '12:00', '18:00', '24:00']}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0.0, 1.5]}
                  ticks={[0.0, 0.5, 1.0, 1.5]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Water Level: {payload[0].value} m
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="level"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#normalRangeGrad)"
                  dot={{ r: 2.5, fill: '#10B981', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 4.5, fill: '#10B981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Culvert Info */}
      {activeTab === 'culvert' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Culvert Technical Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400 text-xs block mb-1">Culvert Classification</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{sector.culvertType || 'Twin-Cell Box Culvert'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400 text-xs block mb-1">Cross-Section Dimensions</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{sector.culvertDimensions || '3.2m × 2.5m RC Box'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400 text-xs block mb-1">Catchment Basin</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{sector.catchmentBasin || 'Yelahanka Lake Basin'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400 text-xs block mb-1">Discharge Capacity</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{sector.dischargeRateCms || 4.8} m³/s</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Historical Hydrology Log
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Peak Flood Level (Past 7 Days)</span>
              <span className="font-bold text-slate-900 dark:text-white">0.85 m</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Average Daily Flow</span>
              <span className="font-bold text-slate-900 dark:text-white">3.2 m³/s</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Last Desilting Operation</span>
              <span className="font-bold text-emerald-600">Completed 14 days ago</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
