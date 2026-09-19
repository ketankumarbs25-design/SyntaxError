/**
 * FLOWSHIELD — ControlPanel
 *
 * Tactical Meteorological & Topographic Configuration Panel:
 * - 4 Standard Hackathon Scenarios:
 *   1. Normal Rain (20 mm/hr)
 *   2. Heavy Rain (80 mm/hr)
 *   3. Drainage Failure (80 mm/hr, 20% drain)
 *   4. Blocked Channel (critical valley flow obstructed)
 * - Fine-grained hydrological sliders (Rainfall rate, Storm duration, Drainage efficiency, Relief multiplier)
 * - Deterministic PRNG Seed input
 * - Primary "Run Simulation" trigger button & Emergency Mode toggle
 */

import React from 'react';
import type { SimConfig } from '../../sim/types';
import { SlideTextButton } from '../kokonutui/slide-text-button';
import { AttractButton } from '../kokonutui/attract-button';

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
  onRunSimulation?: () => void;
  onSelectPresetScenario?: (scenarioName: 'normal' | 'heavy' | 'failure' | 'blocked') => void;
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
  onRunSimulation,
  onSelectPresetScenario,
}) => {
  return (
    <div className="w-full flex flex-col gap-4 bg-[#0a101f]/90 border border-[#17243b] rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base text-cyan-400">⚙️</span>
          <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">
            Hydrological Controls
          </h3>
        </div>
        {isSimulating && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse font-semibold">
            Computing Euler...
          </span>
        )}
      </div>

      {/* 4 Standard Scenarios */}
      <div>
        <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
          Operational Scenarios
        </label>
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          {/* Normal */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('normal');
              else onConfigChange({ rainfallIntensity: 20, drainageEfficiency: 1.0, rainfallDuration: 60 });
            }}
            className={`p-2 rounded-xl border text-left transition-all ${
              config.rainfallIntensity === 20 && config.drainageEfficiency >= 0.9 && blockedCellsCount === 0
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>☀️</span> Normal Rain
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">20 mm/hr • 100% Drain</div>
          </button>

          {/* Heavy */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('heavy');
              else onConfigChange({ rainfallIntensity: 80, drainageEfficiency: 1.0, rainfallDuration: 90 });
            }}
            className={`p-2 rounded-xl border text-left transition-all ${
              config.rainfallIntensity === 80 && config.drainageEfficiency >= 0.9 && blockedCellsCount === 0
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>🌧️</span> Heavy Rain
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">80 mm/hr • 100% Drain</div>
          </button>

          {/* Drainage Failure */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('failure');
              else onConfigChange({ rainfallIntensity: 80, drainageEfficiency: 0.2, rainfallDuration: 90 });
            }}
            className={`p-2 rounded-xl border text-left transition-all ${
              config.rainfallIntensity === 80 && config.drainageEfficiency <= 0.3
                ? 'bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span> Drain Failure
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">80 mm/hr • 20% Drain</div>
          </button>

          {/* Blocked Channel */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('blocked');
              else onConfigChange({ rainfallIntensity: 80, drainageEfficiency: 1.0 });
            }}
            className={`p-2 rounded-xl border text-left transition-all ${
              blockedCellsCount > 0
                ? 'bg-red-500/15 border-red-500/50 text-red-300 ring-1 ring-red-500/30'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>🚧</span> Blocked Channel
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {blockedCellsCount > 0 ? `${blockedCellsCount} obstructed` : 'Outlet blockage'}
            </div>
          </button>
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-3 font-mono text-xs">
        {/* Rainfall Intensity */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Rainfall Rate:</span>
            <span className="font-bold text-cyan-300 tabular-nums">
              {config.rainfallIntensity} mm/hr
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={config.rainfallIntensity}
            onChange={(e) => onConfigChange({ rainfallIntensity: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none border border-slate-800"
          />
        </div>

        {/* Storm Duration */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Storm Duration:</span>
            <span className="font-bold text-cyan-300 tabular-nums">
              {config.rainfallDuration} min
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="180"
            step="5"
            value={config.rainfallDuration}
            onChange={(e) => onConfigChange({ rainfallDuration: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none border border-slate-800"
          />
        </div>

        {/* Drainage Capacity Efficiency */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Drainage Efficiency:</span>
            <span className={`font-bold tabular-nums ${config.drainageEfficiency < 0.4 ? 'text-red-400' : 'text-emerald-400'}`}>
              {(config.drainageEfficiency * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(config.drainageEfficiency * 100)}
            onChange={(e) => onConfigChange({ drainageEfficiency: parseFloat(e.target.value) / 100 })}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none border border-slate-800"
          />
        </div>

        {/* Topographic Relief Multiplier */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Terrain Elevation Relief:</span>
            <span className="font-bold text-slate-200 tabular-nums">
              {config.elevationMultiplier.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={config.elevationMultiplier}
            onChange={(e) => onConfigChange({ elevationMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded-lg appearance-none border border-slate-800"
          />
        </div>

        {/* PRNG Seed Input for Deterministic Terrain */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400 text-[11px]">Synthetic Terrain Seed:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={config.seed}
              onChange={(e) => onConfigChange({ seed: parseInt(e.target.value, 10) || 42 })}
              className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 text-center"
            />
            <button
              onClick={() => onConfigChange({ seed: Math.floor(Math.random() * 9000) + 100 })}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
              title="Generate new random seed"
            >
              🎲
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Channel Indicator / Clear */}
      {blockedCellsCount > 0 && (
        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs font-mono">
          <span className="text-red-300 flex items-center gap-1.5">
            <span>🚧</span> {blockedCellsCount} sector{blockedCellsCount > 1 ? 's' : ''} blocked
          </span>
          <button
            onClick={onResetBlockedChannels}
            className="text-[10px] text-red-300 underline hover:text-white"
          >
            Clear Obstructions
          </button>
        </div>
      )}

      {/* Tactical Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
        {/* Run Simulation Trigger */}
        <button
          onClick={onRunSimulation}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          <span>Execute Simulation</span>
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

        {/* KokonutUI Attract Button */}
        <div className="w-full mt-1">
          <AttractButton
            colorVariant={emergencyMode ? "rose" : "violet"}
            label={emergencyMode ? "🚨 Emergency Active" : "🧲 Attract Flood Sensors"}
            attractLabel={emergencyMode ? "🚨 Disengage Alert" : "⚡ Locking Telemetry..."}
            onClick={onToggleEmergencyMode}
            className="w-full justify-center text-xs font-semibold rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};
