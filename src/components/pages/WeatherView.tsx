import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Activity, ShieldAlert } from 'lucide-react';
import { LocationWeather } from '../location/LocationWeather';
import type { NavTabId } from '../nav/Navbar';

interface WeatherViewProps {
  onApplyRainfall: (intensity: number) => void;
  onNavigateTab: (tab: NavTabId) => void;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ onApplyRainfall, onNavigateTab }) => {
  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      {/* ─── Hero Overview ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-cyan-500/10">
            🌦️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Atmospheric Radar & BBC Weather Telemetry
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                BBC Station 1277333
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live meteorological telemetry synchronized with Bengaluru and global Doppler radar feeds. Real rainfall rates feed directly into FlowShield's hydrodynamic inundation calculations.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('map')}
          className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-end md:self-auto shrink-0"
        >
          <span>Return to Live Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* ─── Main BBC Weather Suite Component ────────────────────────────────── */}
      <LocationWeather onApplyRainfall={onApplyRainfall} />

      {/* ─── Informational Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Activity className="w-4 h-4" />
            <span>How Real Rainfall Drives Flood Modeling</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you click <strong className="text-white">"Simulate This Weather"</strong>, the actual precipitation rate (e.g. 18.5 mm/hr) is converted into hydraulic boundary inflow across all 64 catchment sectors. FlowShield solves for runoff accumulation using elevation topography and soil percolation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Monsoon & Drainage Thresholds</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In urban basins like Bangalore, rainfall exceeding <strong className="text-amber-300">25 mm/hr</strong> overwhelms primary secondary culverts within 45 minutes, creating flash inundation in low-lying sectors (such as B4 and C5).
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherView;
