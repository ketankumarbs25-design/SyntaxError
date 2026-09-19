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
      {/* ─── Hero Overview ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}
          >
            🌦️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Atmospheric Radar & BBC Weather Telemetry
              </h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', fontSize: '10px' }}
              >
                BBC Station 1277333
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Live meteorological telemetry synchronized with Bengaluru and global Doppler radar feeds. Real rainfall rates feed directly into FlowShield's hydrodynamic inundation calculations.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('map')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-end md:self-auto shrink-0"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
        >
          <span>Return to Live Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* ─── Main BBC Weather Suite Component ────────────────────────────────── */}
      <LocationWeather onApplyRainfall={onApplyRainfall} />

      {/* ─── Informational Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl space-y-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            <Activity className="w-4 h-4" />
            <span>How Real Rainfall Drives Flood Modeling</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            When you click <strong style={{ color: 'var(--text-primary)' }}>"Simulate This Weather"</strong>, the actual precipitation rate (e.g. 18.5 mm/hr) is converted into hydraulic boundary inflow across all 64 catchment sectors. FlowShield solves for runoff accumulation using elevation topography and soil percolation.
          </p>
        </div>

        <div className="p-4 rounded-2xl space-y-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--status-warn)' }}>
            <ShieldAlert className="w-4 h-4" />
            <span>Monsoon & Drainage Thresholds</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            In urban basins like Bangalore, rainfall exceeding <strong style={{ color: 'var(--status-warn)' }}>25 mm/hr</strong> overwhelms primary secondary culverts within 45 minutes, creating flash inundation in low-lying sectors (such as B4 and C5).
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherView;
