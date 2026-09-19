/**
 * FLOWSHIELD — TimelineControls
 *
 * Tactical timeline slider and decoupled playback bar.
 * STRICT REQUIREMENTS COMPLIANCE:
 * - Slider indexes precomputed timeline array directly
 * - Instant scrubbing in both directions
 * - Speed selection: 1x, 2x, 4x
 * - Precipitation status indicator (Rain active vs Infiltration/Drainage phase)
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
  const rainThresholdPct = totalSteps > 1 ? (rainfallDuration / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 shadow-xl flex flex-col gap-2">
      {/* Top telemetry & status bar */}
      <div className="flex items-center justify-between text-xs font-telemetry">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 text-[11px] uppercase">Sim Time</span>
            <span className="text-base font-bold text-cyan-400">
              {currentTime.toFixed(0)} <span className="text-[10px] text-slate-400">min</span>
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="text-[11px] text-slate-400">
            Step <span className="text-slate-200 font-bold">{currentStep}</span> / {totalSteps - 1}
          </div>
        </div>

        {/* Rain state badge */}
        <div className="flex items-center gap-2">
          {isRaining ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              Precipitation Active
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
              Recession & Drainage Phase
            </span>
          )}
        </div>
      </div>

      {/* Scrubbing Slider with Rainfall Phase Boundary Marker */}
      <div className="relative w-full py-1">
        {/* Rainfall duration marker line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500/50 pointer-events-none z-10"
          style={{ left: `${Math.min(100, Math.max(0, rainThresholdPct))}%` }}
          title={`Rain ceases at t = ${rainfallDuration} min`}
        />

        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />

        {/* Progress fill visual cue */}
        <div className="flex justify-between text-[9px] font-telemetry text-slate-500 mt-1">
          <span>t = 0m (Start)</span>
          <span className="text-blue-400">Storm End: {rainfallDuration}m</span>
          <span>Final: {totalSteps - 1}m</span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className={`
              px-4 py-1.5 rounded text-xs font-telemetry font-bold flex items-center gap-1.5 transition-all
              ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-500/20'
              }
            `}
          >
            <span>{isPlaying ? '❚❚ PAUSE' : '▶ PLAY'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-telemetry transition-colors"
            title="Reset to Step 0"
          >
            ↺ Reset
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-800 text-[11px] font-telemetry">
          <span className="text-slate-500 text-[10px] px-1">Speed:</span>
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2 py-0.5 rounded transition-colors ${
                playbackSpeed === speed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
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
