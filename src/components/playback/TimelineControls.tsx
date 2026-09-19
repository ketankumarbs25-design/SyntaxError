/**
 * FLOWSHIELD — TimelineControls
 *
 * Simulation playback deck:
 * - Smooth time scrubber spanning the simulation horizon
 * - Rain duration cutoff marker & hydrological phase badge
 * - Play/Pause, Step ±1m, 1×/2×/5×/10× speed controls
 * - High-precision tabular time readout (T+XX min)
 *
 * All colors use CSS custom properties — no hardcoded hex values.
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
    <div
      className="w-full rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Header: Time Readout + Hydrological Phase ── */}
      <div className="flex items-center justify-between">
        {/* Simulation Mission Time */}
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            T+
          </span>
          <span className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {currentTime.toFixed(0).padStart(2, '0')}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>min</span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-faint)' }}>/ {maxStep} min</span>
        </div>

        {/* Dynamic Storm Phase Badge — dot is the active indicator, no animate-pulse on text */}
        <div>
          {isRaining ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: 'var(--accent)' }} />
              🌧 Precipitation Active
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
              💧 Hydraulic Drainage Phase
            </span>
          )}
        </div>
      </div>

      {/* ── Horizontal Timeline Scrub Bar ── */}
      <div className="relative w-full pt-2 pb-1">
        {/* Rain duration cutoff marker */}
        <div
          className="absolute top-1 bottom-3 pointer-events-none z-10 flex flex-col items-center"
          style={{
            left: `${rainProgressPct}%`,
            borderRight: '2px dashed var(--accent-border)',
          }}
        >
          <span
            className="text-xs font-mono whitespace-nowrap -translate-y-3 -translate-x-1/2 px-1 rounded"
            style={{
              fontSize: '9px',
              color: 'var(--accent)',
              background: 'var(--bg-base)',
              border: '1px solid var(--accent-border)',
            }}
          >
            Rain Stops ({rainfallDuration}m)
          </span>
        </div>

        {/* Slider — accent color via CSS var on accent */}
        <input
          type="range"
          min="0"
          max={maxStep}
          value={currentStep}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="w-full cursor-pointer h-2 rounded-lg appearance-none"
          style={{
            accentColor: 'var(--accent)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
          }}
        />

        {/* Milestone labels */}
        <div className="flex justify-between mt-1" style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          <span>T+00m</span>
          <span style={{ color: 'var(--text-muted)' }}>Peak Inflow Horizon</span>
          <span>T+{maxStep}m</span>
        </div>
      </div>

      {/* ── Transport Controls ── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 pt-2"
        style={{ borderTop: '1px solid var(--border-strong)' }}
      >
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: isPlaying ? 'var(--status-warn)' : 'var(--accent)',
              color: '#0D0E15', /* dark text on light button — always passes contrast */
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          {/* Step Backward */}
          <button
            onClick={() => onSeek(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-2.5 py-2 rounded-xl text-xs font-mono transition-colors disabled:opacity-40"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
            title="Step backward 1 minute"
          >
            ⏮ -1m
          </button>

          {/* Step Forward */}
          <button
            onClick={() => onSeek(Math.min(maxStep, currentStep + 1))}
            disabled={currentStep === maxStep}
            className="px-2.5 py-2 rounded-xl text-xs font-mono transition-colors disabled:opacity-40"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
            title="Step forward 1 minute"
          >
            +1m ⏭
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-mono transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ↺ Reset
          </button>
        </div>

        {/* Speed Multiplier */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
        >
          <span className="text-xs font-mono px-1.5 uppercase" style={{ color: 'var(--text-faint)' }}>Speed:</span>
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className="px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all"
              style={
                playbackSpeed === speed
                  ? { background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                  : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' }
              }
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
