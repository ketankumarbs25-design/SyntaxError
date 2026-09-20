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
    <div
      className="w-full flex flex-col gap-4 rounded-2xl p-4 shadow-sm backdrop-blur-md"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: '1px solid var(--border-strong)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⚙️</span>
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Hydrological Controls
          </h3>
        </div>
        {isSimulating && (
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
          >
            Computing Euler...
          </span>
        )}
      </div>

      {/* 4 Standard Scenarios */}
      <div>
        <label className="text-[11px] font-mono uppercase font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>
          Operational Scenarios
        </label>
        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          {/* Normal */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('normal');
              else onConfigChange({ rainfallIntensity: 20, drainageEfficiency: 1.0, rainfallDuration: 60 });
            }}
            className="p-2 rounded-xl text-left transition-all"
            style={
              config.rainfallIntensity === 20 && config.drainageEfficiency >= 0.9 && blockedCellsCount === 0
                ? { background: 'var(--status-safe-subtle)', border: '1px solid var(--status-safe-border)', color: 'var(--status-safe)' }
                : { background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }
            }
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>☀️</span> Normal Rain
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>20 mm/hr • 100% Drain</div>
          </button>

          {/* Heavy */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('heavy');
              else onConfigChange({ rainfallIntensity: 80, drainageEfficiency: 1.0, rainfallDuration: 90 });
            }}
            className="p-2 rounded-xl text-left transition-all"
            style={
              config.rainfallIntensity === 80 && config.drainageEfficiency >= 0.9 && blockedCellsCount === 0
                ? { background: 'var(--status-warn-subtle)', border: '1px solid var(--status-warn-border)', color: 'var(--status-warn)' }
                : { background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }
            }
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>🌧️</span> Heavy Rain
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>80 mm/hr • 100% Drain</div>
          </button>

          {/* Drainage Failure */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('failure');
              else onConfigChange({ rainfallIntensity: 80, drainageEfficiency: 0.2, rainfallDuration: 90 });
            }}
            className="p-2 rounded-xl text-left transition-all"
            style={
              config.rainfallIntensity === 80 && config.drainageEfficiency <= 0.3
                ? { background: 'var(--status-crit-subtle)', border: '1px solid var(--status-crit-border)', color: 'var(--status-crit)' }
                : { background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }
            }
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span> Drain Failure
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>80 mm/hr • 20% Drain</div>
          </button>

          {/* Blocked Channel */}
          <button
            onClick={() => {
              if (onSelectPresetScenario) onSelectPresetScenario('blocked');
              else onConfigChange({ rainfallIntensity: 80, drainageEfficiency: 1.0 });
            }}
            className="p-2 rounded-xl text-left transition-all"
            style={
              blockedCellsCount > 0
                ? { background: 'var(--status-crit-subtle)', border: '1px solid var(--status-crit-border)', color: 'var(--status-crit)' }
                : { background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }
            }
          >
            <div className="font-bold flex items-center gap-1.5">
              <span>🚧</span> Blocked Channel
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {blockedCellsCount > 0 ? `${blockedCellsCount} obstructed` : 'Outlet blockage'}
            </div>
          </button>
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-3 font-mono text-xs">
        {/* Rainfall Intensity */}
        <div>
          <div className="flex justify-between mb-1" style={{ color: 'var(--text-secondary)' }}>
            <span>Rainfall Rate:</span>
            <span className="font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
              {config.rainfallIntensity} mm/hr
            </span>
          </div>
          <input
            type="range" min="0" max="200" step="5"
            value={config.rainfallIntensity}
            onChange={(e) => onConfigChange({ rainfallIntensity: parseFloat(e.target.value) })}
            className="w-full cursor-pointer h-2 rounded-lg appearance-none"
            style={{ accentColor: 'var(--accent)', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        {/* Storm Duration */}
        <div>
          <div className="flex justify-between mb-1" style={{ color: 'var(--text-secondary)' }}>
            <span>Storm Duration:</span>
            <span className="font-bold tabular-nums" style={{ color: 'var(--accent)' }}>
              {config.rainfallDuration} min
            </span>
          </div>
          <input
            type="range" min="15" max="180" step="5"
            value={config.rainfallDuration}
            onChange={(e) => onConfigChange({ rainfallDuration: parseFloat(e.target.value) })}
            className="w-full cursor-pointer h-2 rounded-lg appearance-none"
            style={{ accentColor: 'var(--accent)', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        {/* Drainage Efficiency */}
        <div>
          <div className="flex justify-between mb-1" style={{ color: 'var(--text-secondary)' }}>
            <span>Drainage Efficiency:</span>
            <span
              className="font-bold tabular-nums"
              style={{ color: config.drainageEfficiency < 0.4 ? 'var(--status-crit)' : 'var(--status-safe)' }}
            >
              {(config.drainageEfficiency * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range" min="0" max="100" step="5"
            value={Math.round(config.drainageEfficiency * 100)}
            onChange={(e) => onConfigChange({ drainageEfficiency: parseFloat(e.target.value) / 100 })}
            className="w-full cursor-pointer h-2 rounded-lg appearance-none"
            style={{ accentColor: 'var(--accent)', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        {/* Topographic Relief Multiplier */}
        <div>
          <div className="flex justify-between mb-1" style={{ color: 'var(--text-secondary)' }}>
            <span>Terrain Elevation Relief:</span>
            <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {config.elevationMultiplier.toFixed(2)}x
            </span>
          </div>
          <input
            type="range" min="0.5" max="2.0" step="0.1"
            value={config.elevationMultiplier}
            onChange={(e) => onConfigChange({ elevationMultiplier: parseFloat(e.target.value) })}
            className="w-full cursor-pointer h-2 rounded-lg appearance-none"
            style={{ accentColor: 'var(--accent)', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        {/* PRNG Seed Input */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Synthetic Terrain Seed:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={config.seed}
              onChange={(e) => onConfigChange({ seed: parseInt(e.target.value, 10) || 42 })}
              className="w-16 px-2 py-1 rounded-lg text-xs font-mono text-center"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-strong)', color: 'var(--accent)' }}
            />
            <button
              onClick={() => onConfigChange({ seed: Math.floor(Math.random() * 9000) + 100 })}
              className="px-2 py-1 rounded-lg text-xs font-mono transition-colors"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
              title="Generate new random seed"
            >
              🎲
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Channel Indicator / Clear */}
      {blockedCellsCount > 0 && (
        <div
          className="p-2.5 rounded-xl flex items-center justify-between text-xs font-mono"
          style={{ background: 'var(--status-crit-subtle)', border: '1px solid var(--status-crit-border)' }}
        >
          <span className="flex items-center gap-1.5" style={{ color: 'var(--status-crit)' }}>
            <span>🚧</span> {blockedCellsCount} sector{blockedCellsCount > 1 ? 's' : ''} blocked
          </span>
          <button
            onClick={onResetBlockedChannels}
            className="text-[10px] underline"
            style={{ color: 'var(--status-crit)' }}
          >
            Clear Obstructions
          </button>
        </div>
      )}

      {/* Tactical Actions */}
      <div
        className="flex flex-col gap-2 pt-2"
        style={{ borderTop: '1px solid var(--border-strong)' }}
      >
        {/* Run Simulation Trigger — flat accent, DECORATIVE gradient removed */}
        <button
          onClick={onRunSimulation}
          className="w-full py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)', color: '#0D0E15' }}
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
