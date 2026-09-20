import React, { useState } from 'react';
import {
  MoreHorizontal,
  Sparkles,
  Link2,
  Calendar,
  ChevronDown,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';

interface ZentraAnalyticsHeroProps {
  onSelectTag?: (tag: string) => void;
}

export const ZentraAnalyticsHero: React.FC<ZentraAnalyticsHeroProps> = ({ onSelectTag }) => {
  const [promptQuery, setPromptQuery] = useState('What caused the drop-off in Brahmaputra discharge near Dibrugarh?');
  const [activeDateRange, setActiveDateRange] = useState('Monsoon 2026');

  return (
    <div className="space-y-6">
      {/* ─── Top Title Header (Dribbble Overview Style) ────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Overview
          </h1>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-2xs hover:scale-105 transition-all cursor-pointer"
            title="Copy Overview Link"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Date Range Pill Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => setActiveDateRange((prev) => (prev === 'Monsoon 2026' ? 'Annual Cycle 2026' : 'Monsoon 2026'))}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeDateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <span className="text-slate-400 text-xs font-medium">compared to</span>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold shadow-2xs cursor-pointer hover:border-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>10-Yr Historical Norm</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ─── Hero Stepped Striped Chart Card (Signature "Payments" Card) ──────── */}
      <div className="rounded-[28px] bg-white dark:bg-[#121422] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            River Basin Inflow & Hydro Discharge
          </h2>
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Column Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 mb-8 border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Monsoon Inflow</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              65.2k <span className="text-xs font-normal text-slate-400">m³/s</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium block">Reservoir Storage</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              54.8k <span className="text-xs font-normal text-slate-400">MCM</span>
            </span>
          </div>

          <div className="border-l border-blue-500/30 pl-4">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">Active Telemetry</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              48.6k <span className="text-xs font-normal text-slate-400">readings</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium block">Riparian Runoff</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              38.3k <span className="text-xs font-normal text-slate-400">m³/s</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium block">Peak Outflow</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              32.9k <span className="text-xs font-normal text-slate-400">m³/s</span>
            </span>
          </div>
        </div>

        {/* 3D-Angled Translucent Striped Stepped Bars Graphic */}
        <div className="relative h-64 sm:h-72 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 pt-6 pb-2 overflow-visible">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] text-slate-400 font-mono">
            <div className="border-b border-slate-300 dark:border-slate-700 w-full flex justify-between"><span>70k</span></div>
            <div className="border-b border-slate-300 dark:border-slate-700 w-full flex justify-between"><span>60k</span></div>
            <div className="border-b border-slate-300 dark:border-slate-700 w-full flex justify-between"><span>50k</span></div>
            <div className="border-b border-slate-300 dark:border-slate-700 w-full flex justify-between"><span>40k</span></div>
            <div className="border-b border-slate-300 dark:border-slate-700 w-full flex justify-between"><span>30k</span></div>
          </div>

          {/* Bar 1: 65.2k (Blue Striped Angled Bar) */}
          <div className="relative flex-1 h-[88%] group cursor-pointer flex flex-col justify-end">
            <div
              className="w-full h-full rounded-t-xl opacity-90 transition-all group-hover:opacity-100 group-hover:scale-[1.02]"
              style={{
                background: 'repeating-linear-gradient(45deg, #2563EB, #2563EB 4px, #60A5FA 4px, #60A5FA 8px)',
                boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
              }}
            />
            <div className="w-full h-2 bg-blue-400/60 rounded-full mt-1.5" />
          </div>

          {/* Bar 2: 54.8k */}
          <div className="relative flex-1 h-[74%] group cursor-pointer flex flex-col justify-end">
            <div
              className="w-full h-full rounded-t-xl opacity-80 transition-all group-hover:opacity-100 group-hover:scale-[1.02]"
              style={{
                background: 'repeating-linear-gradient(45deg, #3B82F6, #3B82F6 4px, #93C5FD 4px, #93C5FD 8px)',
                boxShadow: '0 8px 24px rgba(59,130,246,0.2)',
              }}
            />
            <div className="w-full h-2 bg-blue-400/50 rounded-full mt-1.5" />
          </div>

          {/* Bar 3: 48.6k (Active Highlighted Column with Solid Gradient + Floating Badge) */}
          <div className="relative flex-1 h-[66%] group cursor-pointer flex flex-col justify-end">
            {/* Floating Interactive Badge (Dribbble Signature Tooltip) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-slate-800 dark:text-slate-100 shadow-xl flex items-center gap-2 pointer-events-none">
              <span className="font-bold text-blue-600 dark:text-blue-400">48.6k telemetry</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span>Conversion: <strong className="text-emerald-500">89%</strong></span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-slate-400">Drop-off: <strong className="text-blue-500">-11%</strong></span>
            </div>

            <div
              className="w-full h-full rounded-t-xl bg-gradient-to-b from-blue-600 via-blue-500 to-indigo-600 shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-[1.02]"
            />
            <div className="w-full h-2 bg-blue-500 rounded-full mt-1.5" />
          </div>

          {/* Bar 4: 38.3k */}
          <div className="relative flex-1 h-[52%] group cursor-pointer flex flex-col justify-end">
            <div
              className="w-full h-full rounded-t-xl opacity-75 transition-all group-hover:opacity-100 group-hover:scale-[1.02]"
              style={{
                background: 'repeating-linear-gradient(45deg, #3B82F6, #3B82F6 4px, #BFDBFE 4px, #BFDBFE 8px)',
                boxShadow: '0 8px 20px rgba(59,130,246,0.15)',
              }}
            />
            <div className="w-full h-2 bg-blue-300/60 rounded-full mt-1.5" />
          </div>

          {/* Bar 5: 32.9k */}
          <div className="relative flex-1 h-[44%] group cursor-pointer flex flex-col justify-end">
            <div
              className="w-full h-full rounded-t-xl opacity-65 transition-all group-hover:opacity-100 group-hover:scale-[1.02]"
              style={{
                background: 'repeating-linear-gradient(45deg, #60A5FA, #60A5FA 4px, #DBEAFE 4px, #DBEAFE 8px)',
                boxShadow: '0 8px 16px rgba(96,165,250,0.15)',
              }}
            />
            <div className="w-full h-2 bg-blue-300/40 rounded-full mt-1.5" />
          </div>
        </div>

        {/* Explore AI Prompt Bar at Bottom */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-400/15 to-transparent border border-blue-200/70 dark:border-blue-800/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>What would you like to explore next?</span>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/90 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <input
              type="text"
              value={promptQuery}
              onChange={(e) => setPromptQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-400"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onSelectTag?.('/severe stations')}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-mono hover:bg-amber-500/20 cursor-pointer"
              >
                /severe stations
              </button>
              <button
                type="button"
                onClick={() => onSelectTag?.('/brahmaputra basin')}
                className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[11px] font-mono hover:bg-blue-500/20 cursor-pointer"
              >
                /brahmaputra basin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom 4-Card Sleek Metric Grid (Exact Dribbble Cards) ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Basin Water Retention (Stepped Line Graph Card) */}
        <div className="rounded-[24px] bg-white dark:bg-[#121422] border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-900 dark:text-white text-base">Retention</span>
            <button
              type="button"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative h-28 w-full flex items-center justify-center">
            {/* 42% Peak Badge */}
            <div className="absolute top-1 left-1/3 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-800 dark:text-slate-200">
              42%
            </div>

            {/* Stepped Pink Line SVG */}
            <svg className="w-full h-full" viewBox="0 0 200 80" fill="none">
              <path
                d="M 5,75 L 30,75 L 30,55 L 55,55 L 55,40 L 75,40 L 75,25 L 90,25 L 90,20 L 115,20 L 115,35 L 135,35 L 135,50 L 155,50 L 155,60 L 175,60 L 175,70 L 195,70"
                stroke="#F43F5E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="miter"
              />
              {/* Stepped Bars Fill Underneath */}
              <line x1="30" y1="55" x2="30" y2="78" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="55" y1="40" x2="55" y2="78" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="75" y1="25" x2="75" y2="78" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="90" y1="20" x2="90" y2="78" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="115" y1="20" x2="115" y2="78" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="135" y1="35" x2="135" y2="78" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Catchment storage</span>
            <span className="font-semibold text-rose-500">+8.4% capacity</span>
          </div>
        </div>

        {/* Card 2: Transactions / Telemetry Stream (106k Dot Matrix Card) */}
        <div className="rounded-[24px] bg-white dark:bg-[#121422] border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 dark:text-white text-base">Telemetry Stream</span>
            <button
              type="button"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between my-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              106k
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700">
              Peak: <strong className="text-emerald-500">Wed</strong>
            </span>
          </div>

          {/* Dot Matrix / Step Bars Activity Indicator */}
          <div className="flex items-end justify-between gap-1.5 h-12 my-2 px-1">
            <span className="w-2.5 h-3 rounded-full bg-emerald-300/80" />
            <span className="w-2.5 h-4 rounded-full bg-emerald-400/80" />
            <span className="w-2.5 h-6 rounded-full bg-emerald-500" />
            <span className="w-2.5 h-9 rounded-full bg-emerald-600 shadow-xs" />
            <span className="w-2.5 h-12 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
            <span className="w-2.5 h-8 rounded-full bg-emerald-400/80" />
            <span className="w-2.5 h-5 rounded-full bg-emerald-300/70" />
            <span className="w-2.5 h-4 rounded-full bg-emerald-300/60" />
            <span className="w-2.5 h-3 rounded-full bg-emerald-300/50" />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">vs last monsoon</span>
            <span className="font-bold text-slate-900 dark:text-white">+34,002</span>
          </div>
        </div>

        {/* Card 3: Gross Volume (Discharge with Striped Progress Bars) */}
        <div className="rounded-[24px] bg-white dark:bg-[#121422] border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 dark:text-white text-base">Gross Volume</span>
            <button
              type="button"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight my-1">
            $41,5<span className="text-slate-400 text-2xl font-semibold">k</span>
          </div>

          {/* Striped Segmented Progress Bars (Signature from Dribbble image) */}
          <div className="space-y-2.5 my-2">
            {/* Green Striped Bar: Online Telemetry */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Online Telemetry</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">82%</span>
              </div>
              <div
                className="w-full h-3 rounded-full border border-emerald-400/40"
                style={{
                  background: 'repeating-linear-gradient(45deg, #10B981, #10B981 3px, #6EE7B7 3px, #6EE7B7 6px)',
                }}
              />
            </div>

            {/* Blue Striped Bar: Inflow */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Reservoir Subscriptions</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">64%</span>
              </div>
              <div
                className="w-full h-3 rounded-full border border-blue-400/40"
                style={{
                  background: 'repeating-linear-gradient(45deg, #3B82F6, #3B82F6 3px, #93C5FD 3px, #93C5FD 6px)',
                }}
              />
            </div>

            {/* Pink Striped Bar: In-Store / Field Telemetry */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Field Dispatch</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">28%</span>
              </div>
              <div
                className="w-full h-3 rounded-full border border-rose-400/40"
                style={{
                  background: 'repeating-linear-gradient(45deg, #F43F5E, #F43F5E 3px, #FDA4AF 3px, #FDA4AF 6px)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Sunset/Twilight Mesh Gradient Insights Card */}
        <div className="rounded-[24px] p-6 shadow-md relative overflow-hidden flex flex-col justify-between text-white bg-gradient-to-br from-[#FF9A8B] via-[#FF6A88] to-[#2E73B8]">
          <div className="flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold">
              <Lightbulb className="w-3.5 h-3.5" /> Insights
            </span>
            <ArrowUpRight className="w-5 h-5 text-white/80" />
          </div>

          <div className="z-10 my-4">
            <div className="text-5xl sm:text-6xl font-black tracking-tight drop-shadow-sm">
              75%
            </div>
            <p className="text-xs font-medium text-white/90 mt-1 leading-snug">
              Safe River Capacity & Reservoir Flood Cushion Maintained Nationwide.
            </p>
          </div>

          <div className="z-10 pt-2 border-t border-white/25 flex items-center justify-between text-xs text-white/80">
            <span>CWC Telemetry SLA</span>
            <span className="font-bold text-white">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZentraAnalyticsHero;
