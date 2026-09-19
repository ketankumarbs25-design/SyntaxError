/**
 * FLOWSHIELD — TimelineControls
 *
 * Tactical horizontal scrub deck positioned directly beneath the heatmap canvas:
 * - Smooth horizontal time slider spanning the full simulation horizon
 * - Clear rain duration cutoff marker & phase status (Precipitation vs Gravitational Drainage)
 * - Play / Pause, Step -1m / +1m, and 1x / 2x / 5x / 10x speed controls
 * - High-precision tabular time readout (T+XX min)
 */

import React from 'react';
import type { SimState } from '../../sim/types';

interface TimelineControlsProps {
  currentStep: number;
  totalSteps: number;
  currentTime: number;
  rainfallDuration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  currentState?: SimState;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentStep,
  totalSteps,
  currentTime,
  rainfallDuration,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onReset,
  onSeek,
  onSpeedChange,
}) => {
  const isRaining = currentTime < rainfallDuration;
  const maxStep = Math.max(0, totalSteps - 1);
  const rainProgressPct = Math.min(100, (rainfallDuration / (maxStep || 1)) * 100);

  const speedOptions = [1, 2, 5, 10];

  return (
    <div className="w-full bg-[#0a101f]/90 border border-[#17243b] rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      {/* Top Header: Time Readout + Hydrological Phase */}
      <div className="flex items-center justify-between">
        {/* Simulation Mission Time */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-baseline gap-1.5">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Mission Time</span>
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              T+{currentTime.toFixed(0).padStart(2, '0')}
            </span>
            <span className="text-slate-400 text-xs">min</span>
          </div>
          <span className="text-slate-600 text-xs">/ {maxStep} min</span>
        </div>

        {/* Dynamic Storm Phase Badge */}
        <div>
          {isRaining ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold shadow-sm shadow-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              🌧️ Precipitation Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              💧 Hydraulic Drainage Phase
            </span>
          )}
        </div>
      </div>

      {/* Large Horizontal Timeline Scrub Bar */}
      <div className="relative w-full pt-2 pb-1">
        {/* Visual Rain Duration Threshold Marker */}
        <div
          className="absolute top-1 bottom-3 border-r-2 border-dashed border-cyan-400/60 pointer-events-none z-10 flex flex-col items-center"
          style={{ left: `${rainProgressPct}%` }}
        >
          <span className="text-[9px] font-mono text-cyan-300 bg-slate-950/90 px-1 rounded -translate-y-3 -translate-x-1/2 whitespace-nowrap border border-cyan-500/30">
            Rain Stops ({rainfallDuration}m)
          </span>
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max={maxStep}
          value={currentStep}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="w-full accent-cyan-400 cursor-pointer h-2.5 bg-slate-900 rounded-lg appearance-none border border-slate-800 transition-all hover:border-cyan-500/50"
        />

        {/* Milestone Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
          <span>T+00m (Inception)</span>
          <span className="text-cyan-400/70">Peak Inflow Horizon</span>
          <span>T+{maxStep}m (Settled)</span>
        </div>
      </div>

      {/* Transport Controls Deck */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Play / Pause Primary Button */}
          <button
            onClick={onTogglePlay}
            className={`px-5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            <span>{isPlaying ? '⏸ PAUSE' : '▶ PLAY'}</span>
          </button>

          {/* Step Backward -1m */}
          <button
            onClick={() => onSeek(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-2.5 py-2 rounded-xl text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40 transition-colors"
            title="Step backward 1 minute"
          >
            ⏮ -1m
          </button>

          {/* Step Forward +1m */}
          <button
            onClick={() => onSeek(Math.min(maxStep, currentStep + 1))}
            disabled={currentStep === maxStep}
            className="px-2.5 py-2 rounded-xl text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40 transition-colors"
            title="Step forward 1 minute"
          >
            +1m ⏭
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-mono bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            ↺ Reset
          </button>
        </div>

        {/* Speed Multiplier Controls (1x, 2x, 5x, 10x) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 px-1.5 uppercase">Speed:</span>
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                playbackSpeed === speed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
