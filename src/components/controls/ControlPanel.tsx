/**
 * FLOWSHIELD — ControlPanel
 *
 * Tactical control center for hydrological parameters and scenarios.
 * ROBUST INPUT VALIDATION:
 * - Every numeric input is strictly validated and clamped
 * - Rejects NaN without ever throwing or crashing
 * - Presets: Normal (20) / Heavy (80) / Extreme (160 mm/hr)
 * - Scenarios: Drainage Failure, Blocked Channel, Emergency Mode, Demo Mode
 */

import React from 'react';
import type { SimConfig } from '../../sim/types';

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
  // Safe numeric parser helper
  const handleNumericInput = (
    field: keyof SimConfig,
    rawVal: string,
    min: number,
    max: number,
    isPercent: boolean = false
  ) => {
    const parsed = parseFloat(rawVal);
    if (isNaN(parsed)) return; // Reject NaN silently

    const clamped = Math.min(max, Math.max(min, parsed));
    const finalVal = isPercent ? clamped / 100 : clamped;
    onConfigChange({ [field]: finalVal });
  };

  return (
    <div className="w-full flex flex-col gap-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="font-telemetry font-bold text-xs uppercase tracking-wider text-slate-200">
            Meteorological Controls
          </h2>
        </div>
        {isSimulating && (
          <span className="text-[10px] font-telemetry px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
            Worker Active
          </span>
        )}
      </div>

      {/* Preset Selectors */}
      <div>
        <label className="text-[10px] font-telemetry uppercase tracking-wider text-slate-400 block mb-1.5">
          Rainfall Intensity Presets
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Normal', value: 20, color: 'text-emerald-300 border-emerald-800/60 bg-emerald-950/20' },
            { label: 'Heavy', value: 80, color: 'text-amber-300 border-amber-800/60 bg-amber-950/20' },
            { label: 'Extreme', value: 160, color: 'text-red-300 border-red-800/60 bg-red-950/20' },
          ].map((preset) => {
            const isSelected = config.rainfallIntensity === preset.value;
            return (
              <button
                key={preset.label}
                onClick={() => onConfigChange({ rainfallIntensity: preset.value })}
                className={`
                  py-1.5 px-2 rounded text-xs font-telemetry font-bold border transition-all duration-150
                  ${preset.color}
                  ${isSelected ? 'ring-1 ring-white/60 shadow-lg' : 'opacity-70 hover:opacity-100'}
                `}
              >
                {preset.label} ({preset.value})
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Input 1: Rainfall Intensity */}
      <div>
        <div className="flex justify-between text-xs font-telemetry mb-1">
          <span className="text-slate-300">Precipitation Rate</span>
          <span className="font-bold text-cyan-400">{config.rainfallIntensity} mm/hr</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="5"
          value={config.rainfallIntensity}
          onChange={(e) => handleNumericInput('rainfallIntensity', e.target.value, 0, 200)}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-telemetry text-slate-500 mt-0.5">
          <span>0 mm/hr (Dry)</span>
          <span>100 mm/hr</span>
          <span>200 mm/hr (Torrential)</span>
        </div>
      </div>

      {/* Primary Input 2: Storm Duration */}
      <div>
        <div className="flex justify-between text-xs font-telemetry mb-1">
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
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-telemetry text-slate-500 mt-0.5">
          <span>15 min</span>
          <span>90 min</span>
          <span>180 min</span>
        </div>
      </div>

      {/* Primary Input 3: Drainage Efficiency */}
      <div>
        <div className="flex justify-between text-xs font-telemetry mb-1">
          <span className="text-slate-300">Drainage Capacity</span>
          <span className="font-bold text-cyan-400">
            {Math.round(config.drainageEfficiency * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={Math.round(config.drainageEfficiency * 100)}
          onChange={(e) => handleNumericInput('drainageEfficiency', e.target.value, 0, 100, true)}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-telemetry text-slate-500 mt-0.5">
          <span>0% (Saturated/Blocked)</span>
          <span>50%</span>
          <span>100% (Nominal)</span>
        </div>
      </div>

      {/* Primary Input 4: Elevation Multiplier */}
      <div>
        <div className="flex justify-between text-xs font-telemetry mb-1">
          <span className="text-slate-300">Relief / Topography Relief</span>
          <span className="font-bold text-cyan-400">{config.elevationMultiplier.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="2.5"
          step="0.1"
          value={config.elevationMultiplier}
          onChange={(e) => handleNumericInput('elevationMultiplier', e.target.value, 0.2, 2.5)}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] font-telemetry text-slate-500 mt-0.5">
          <span>0.2x (Flat Basin)</span>
          <span>1.0x (Standard)</span>
          <span>2.5x (Steep Valley)</span>
        </div>
      </div>

      {/* Tactical Scenarios Section */}
      <div className="pt-2 border-t border-slate-800">
        <label className="text-[10px] font-telemetry uppercase tracking-wider text-slate-400 block mb-2">
          Tactical Stress Scenarios
        </label>
        <div className="flex flex-col gap-1.5">
          {/* Drainage Failure */}
          <button
            onClick={() => onConfigChange({ drainageEfficiency: 0.15 })}
            className="w-full py-1.5 px-2.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left text-xs font-telemetry flex items-center justify-between text-amber-300 transition-colors"
          >
            <span>Drainage Network Failure</span>
            <span className="text-[10px] text-slate-400 font-mono">Eff: 15%</span>
          </button>

          {/* Blocked Channel Indicator / Reset */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 py-1.5 px-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs font-telemetry flex items-center justify-between text-slate-300">
              <span>Blocked Channels</span>
              <span className={`text-[10px] font-bold ${blockedCellsCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {blockedCellsCount} Active
              </span>
            </div>
            {blockedCellsCount > 0 && (
              <button
                onClick={onResetBlockedChannels}
                className="py-1.5 px-2.5 rounded bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs font-telemetry font-bold transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Emergency Mode Toggle */}
          <button
            onClick={onToggleEmergencyMode}
            className={`
              w-full py-1.5 px-2.5 rounded text-left text-xs font-telemetry flex items-center justify-between border transition-all duration-150
              ${
                emergencyMode
                  ? 'bg-red-600/30 border-red-500 text-red-200 ring-1 ring-red-500 font-bold'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300'
              }
            `}
          >
            <span>Emergency Mode</span>
            <span className="text-[10px] font-mono">
              {emergencyMode ? 'ON (Dim Non-Crit)' : 'OFF'}
            </span>
          </button>

          {/* Demo Mode Button */}
          <button
            onClick={onStartDemoMode}
            className={`
              w-full mt-1 py-2 px-3 rounded text-center text-xs font-telemetry font-bold border transition-all duration-200
              ${
                isDemoMode
                  ? 'bg-purple-600/40 border-purple-400 text-purple-200 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 hover:from-cyan-800/50 hover:to-blue-800/50 border-cyan-700/60 text-cyan-200'
              }
            `}
          >
            {isDemoMode ? '★ Demo Mode Playing' : '▶ Launch 90s Narrated Demo'}
          </button>
        </div>
      </div>
    </div>
  );
};
