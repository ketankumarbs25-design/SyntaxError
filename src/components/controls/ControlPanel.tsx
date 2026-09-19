/**
 * FLOWSHIELD — ControlPanel (Simplified)
 *
 * Storm settings with friendly labels and emoji presets.
 * No jargon — just clear controls anyone can understand.
 */

import React from 'react';
import type { SimConfig } from '../../sim/types';
import { SlideTextButton } from '../kokonutui/slide-text-button';

interface ControlPanelProps {
  config: SimConfig;
  onConfigChange: (updated: Partial<SimConfig>) => void;
  emergencyMode: boolean;
  onToggleEmergencyMode: () => void;
  blockedCellsCount: number;
  onResetBlockedChannels: () => void;
  isSimulating: boolean;
  onStartDemoMode: () => void;
  isDemoMode: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onConfigChange,
  emergencyMode,
  onToggleEmergencyMode,
  blockedCellsCount,
  onResetBlockedChannels,
  isSimulating,
  onStartDemoMode,
  isDemoMode,
}) => {
  const handleNumericInput = (
    field: keyof SimConfig,
    rawVal: string,
    min: number,
    max: number,
    isPercent: boolean = false
  ) => {
    const parsed = parseFloat(rawVal);
    if (isNaN(parsed)) return;
    const clamped = Math.min(max, Math.max(min, parsed));
    const finalVal = isPercent ? clamped / 100 : clamped;
    onConfigChange({ [field]: finalVal });
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🌧️</span>
          <h2 className="font-semibold text-sm text-white">Storm Settings</h2>
        </div>
        {isSimulating && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse font-medium">
            Calculating...
          </span>
        )}
      </div>

      {/* Storm Presets */}
      <div>
        <label className="text-xs text-slate-400 block mb-2 font-medium">
          Choose Storm Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '☀️ Light', value: 20, active: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30', idle: 'bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-emerald-500/10' },
            { label: '🌧️ Heavy', value: 80, active: 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30', idle: 'bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-amber-500/10' },
            { label: '⛈️ Extreme', value: 160, active: 'bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/30', idle: 'bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-red-500/10' },
          ].map((preset) => {
            const isSelected = config.rainfallIntensity === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => onConfigChange({ rainfallIntensity: preset.value })}
                className={`py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${isSelected ? preset.active : preset.idle}`}
              >
                <div>{preset.label}</div>
                <div className="text-[10px] mt-0.5 opacity-70">{preset.value} mm/hr</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rain Intensity Slider */}
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-300">Rain Intensity</span>
          <span className="font-bold text-cyan-400">{config.rainfallIntensity} mm/hr</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="5"
          value={config.rainfallIntensity}
          onChange={(e) => handleNumericInput('rainfallIntensity', e.target.value, 0, 200)}
          className="w-full accent-cyan-400 cursor-pointer h-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0 (Dry)</span>
          <span>100</span>
          <span>200 (Torrential)</span>
        </div>
      </div>

      {/* Storm Duration Slider */}
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-300">Storm Duration</span>
          <span className="font-bold text-cyan-400">{config.rainfallDuration} min</span>
        </div>
        <input
          type="range"
          min="15"
          max="180"
          step="5"
          value={config.rainfallDuration}
          onChange={(e) => handleNumericInput('rainfallDuration', e.target.value, 15, 180)}
          className="w-full accent-cyan-400 cursor-pointer h-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>15 min</span>
          <span>90 min</span>
          <span>3 hours</span>
        </div>
      </div>

      {/* Drainage Slider */}
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-300">Drainage Quality</span>
          <span className="font-bold text-cyan-400">{Math.round(config.drainageEfficiency * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={Math.round(config.drainageEfficiency * 100)}
          onChange={(e) => handleNumericInput('drainageEfficiency', e.target.value, 0, 100, true)}
          className="w-full accent-cyan-400 cursor-pointer h-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>0% (Blocked)</span>
          <span>50%</span>
          <span>100% (Perfect)</span>
        </div>
      </div>

      {/* Terrain */}
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-300">Terrain Steepness</span>
          <span className="font-bold text-cyan-400">{config.elevationMultiplier.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="2.5"
          step="0.1"
          value={config.elevationMultiplier}
          onChange={(e) => handleNumericInput('elevationMultiplier', e.target.value, 0.2, 2.5)}
          className="w-full accent-cyan-400 cursor-pointer h-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Flat</span>
          <span>Normal</span>
          <span>Very Steep</span>
        </div>
      </div>

      {/* Scenarios */}
      <div className="pt-3 border-t border-slate-800/60 space-y-2">
        <label className="text-xs text-slate-400 block font-medium">Quick Scenarios</label>

        {/* Drainage Failure */}
        <button
          onClick={() => onConfigChange({ drainageEfficiency: 0.15 })}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800/50 hover:bg-amber-500/10 border border-slate-700/40 hover:border-amber-500/30 text-left text-sm flex items-center justify-between text-slate-200 transition-all"
        >
          <span className="flex items-center gap-2">
            <span>🚫</span>
            <span>Drainage Failure</span>
          </span>
          <span className="text-xs text-slate-500">Sets to 15%</span>
        </button>

        {/* Blocked Channels */}
        <div className="flex items-center gap-2">
          <div className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-sm flex items-center justify-between text-slate-200">
            <span className="flex items-center gap-2">
              <span>🧱</span>
              <span>Blocked Zones</span>
            </span>
            <span className={`text-xs font-semibold ${blockedCellsCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
              {blockedCellsCount} active
            </span>
          </div>
          {blockedCellsCount > 0 && (
            <button
              onClick={onResetBlockedChannels}
              className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-all"
            >
              Clear
            </button>
          )}
        </div>

        {/* Emergency Mode */}
        <button
          onClick={onToggleEmergencyMode}
          className={`w-full py-2.5 px-3 rounded-xl text-left text-sm flex items-center justify-between border transition-all ${
            emergencyMode
              ? 'bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/30'
              : 'bg-slate-800/50 hover:bg-slate-800/70 border-slate-700/40 text-slate-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🚨</span>
            <span>Emergency Mode</span>
          </span>
          <span className="text-xs font-medium">{emergencyMode ? 'ON — Highlighting floods only' : 'OFF'}</span>
        </button>

        {/* Demo Mode */}
        <div className="w-full mt-1">
          <SlideTextButton
            variant="cyan"
            text={isDemoMode ? '🎬 Demo Playing...' : '▶ Watch Demo (90 seconds)'}
            hoverText={isDemoMode ? '⏹ Click to Exit Demo' : '🎬 Launch Narrated Sim'}
            onClick={onStartDemoMode}
            className={
              isDemoMode
                ? 'bg-purple-500/20 border-purple-400/50 text-purple-300 animate-pulse'
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};
