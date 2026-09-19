import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertTriangle, ArrowRight, CloudSun, FlaskConical, LifeBuoy } from 'lucide-react';
import type { SimConfig, SimState, CellState } from '../../sim/types';
import { LiveStats } from '../stats/LiveStats';
import { FloodGrid } from '../grid/FloodGrid';
import { TimelineControls } from '../playback/TimelineControls';
import { DemoNarrative } from '../demo/DemoNarrative';
import type { NavTabId } from '../nav/Navbar';

interface LiveMapViewProps {
  config: SimConfig;
  currentState: SimState;
  timeline: SimState[];
  currentStep: number;
  rainfallDuration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  blockedCells: Set<string>;
  selectedCellId: string | null;
  emergencyMode: boolean;
  isDemoMode: boolean;
  onCellClick: (cell: CellState) => void;
  onExitDemoMode: () => void;
  onNavigateTab: (tab: NavTabId) => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  config,
  currentState,
  timeline,
  currentStep,
  rainfallDuration,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onReset,
  onSeek,
  onSpeedChange,
  blockedCells,
  selectedCellId,
  emergencyMode,
  isDemoMode,
  onCellClick,
  onExitDemoMode,
  onNavigateTab,
}) => {
  const isAllSafe = currentState.stats.criticalCells === 0 && currentState.stats.warningCells === 0;

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto">
      {/* ─── Humanized City Status Hero ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl backdrop-blur-xl ${
          isAllSafe
            ? 'bg-gradient-to-r from-slate-900/90 via-emerald-950/20 to-slate-900/90 border-emerald-500/30'
            : 'bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 border-amber-500/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
              isAllSafe
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            {isAllSafe ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isAllSafe
                  ? 'Bengaluru Urban Catchment: Safe Drainage'
                  : `Active Inundation Alert: ${currentState.stats.criticalCells} Critical Zone(s)`}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAllSafe
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}
              >
                {isAllSafe ? '● All Sectors Clear' : '● Inundation In Progress'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAllSafe
                ? 'Surface runoff is flowing through primary storm culverts without significant accumulation.'
                : `${currentState.stats.affectedPopulation.toLocaleString()} residents in low-lying zones may experience standing water. Monitor evacuation corridors.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => onNavigateTab('weather')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
            <span>Radar & BBC Weather</span>
          </button>
          <button
            onClick={() => onNavigateTab('safety')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-cyan-300" />
            <span>Citizen Safety Guide</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* ─── Demo Narrative (When Active) ────────────────────────────────────── */}
      {isDemoMode && (
        <DemoNarrative
          time={currentState.time}
          rainfallDuration={config.rainfallDuration}
          criticalCount={currentState.stats.criticalCells}
          warningCount={currentState.stats.warningCells}
          onExit={onExitDemoMode}
        />
      )}

      {/* ─── Live Metrics Summary Bar ────────────────────────────────────────── */}
      <LiveStats
        stats={currentState.stats}
        totalCells={config.rows * config.cols}
      />

      {/* ─── Hydrodynamic Flood Map Grid ─────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <div className="w-full flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">8×8 Catchment Sectors (A1 - H8)</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Click any sector to inspect water depth and terrain elevation</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40" /> Safe (&lt;0.15m)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/60" /> Warning (&gt;0.15m)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/80" /> Critical (&gt;0.5m)
            </span>
          </div>
        </div>

        <FloodGrid
          cells={currentState.cells}
          rows={config.rows}
          cols={config.cols}
          blockedCells={blockedCells}
          selectedCellId={selectedCellId}
          emergencyMode={emergencyMode}
          onCellClick={onCellClick}
        />
      </div>

      {/* ─── Timeline Playback Controller ────────────────────────────────────── */}
      <TimelineControls
        currentStep={currentStep}
        totalSteps={timeline.length}
        currentTime={currentState.time}
        rainfallDuration={rainfallDuration}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onTogglePlay={onTogglePlay}
        onReset={onReset}
        onSeek={onSeek}
        onSpeedChange={onSpeedChange}
        currentState={currentState}
      />

      {/* ─── Bottom Shortcuts to Humanized Tools ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div
          onClick={() => onNavigateTab('weather')}
          className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-cyan-400 text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <CloudSun className="w-4 h-4" /> Real-time Weather
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-white font-semibold">BBC Weather & 7-Day Radar Suite</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Explore 24-hour rainfall curves, UV ratings, and air quality indices.</p>
        </div>

        <div
          onClick={() => onNavigateTab('storm-lab')}
          className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-blue-400 text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4" /> Storm Lab
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-white font-semibold">Scenario Modeling & Drainage Stress</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Simulate cloudbursts, test drainage failures, and inspect hydrograph curves.</p>
        </div>

        <div
          onClick={() => onNavigateTab('safety')}
          className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4" /> Citizen Safety
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-white font-semibold">Evacuation Routes & Hotline Directory</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Find high-ground shelters, emergency checklists, and state disaster helplines.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveMapView;
