/**
 * FLOWSHIELD — TimelineControls (Simplified)
 *
 * Clean playback bar: "Minute 45 of 90", big play/pause buttons.
 * Clear "Raining" / "Draining" badge instead of jargon.
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

  return (
    <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Time Display */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400">⏱️</span>
            <span className="text-xl font-bold text-white tabular-nums">
              {currentTime.toFixed(0)}
            </span>
            <span className="text-slate-400 text-xs">min</span>
          </div>
          <span className="text-slate-600">of {totalSteps - 1} min</span>
        </div>

        {/* Rain Status */}
        {isRaining ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            🌧️ Raining
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-slate-800/60 text-slate-400 text-xs font-medium border border-slate-700/40">
            ☀️ Storm Over — Water Draining
          </span>
        )}
      </div>

      {/* Timeline Slider */}
      <div className="relative w-full">
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Start</span>
          <span className="text-blue-400/80">Storm ends: {rainfallDuration}m</span>
          <span>End: {totalSteps - 1}m</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            <span>{isPlaying ? '⏸ Pause' : '▶ Play'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-sm transition-colors border border-slate-700/40"
            title="Back to start"
          >
            ↺ Reset
          </button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1.5 bg-slate-800/40 p-1 rounded-xl border border-slate-700/30">
          <span className="text-slate-500 text-xs px-1.5">Speed:</span>
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                playbackSpeed === speed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
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
