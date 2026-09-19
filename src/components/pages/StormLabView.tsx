import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { SimConfig, SimState } from '../../sim/types';
import type { ScenariosSummary } from '../../worker/simWorker';
import { ControlPanel } from '../controls/ControlPanel';
import { ScenarioComparison } from '../scenarios/ScenarioComparison';
import { Charts } from '../charts/Charts';
import type { NavTabId } from '../nav/Navbar';

interface StormLabViewProps {
  config: SimConfig;
  onConfigChange: (updated: Partial<SimConfig>) => void;
  timeline: SimState[];
  currentStep: number;
  onSeek: (step: number) => void;
  scenarios: ScenariosSummary | null;
  isLoadingScenarios: boolean;
  emergencyMode: boolean;
  onToggleEmergencyMode: () => void;
  blockedCellsCount: number;
  onResetBlockedChannels: () => void;
  isSimulating: boolean;
  onStartDemoMode: () => void;
  isDemoMode: boolean;
  onNavigateTab: (tab: NavTabId) => void;
}

export const StormLabView: React.FC<StormLabViewProps> = ({
  config,
  onConfigChange,
  timeline,
  currentStep,
  onSeek,
  scenarios,
  isLoadingScenarios,
  emergencyMode,
  onToggleEmergencyMode,
  blockedCellsCount,
  onResetBlockedChannels,
  isSimulating,
  onStartDemoMode,
  isDemoMode,
  onNavigateTab,
}) => {
  return (
    <div className="max-w-[1440px] mx-auto space-y-4">
      {/* ─── Hero Overview ───────────────────────────────────────────────────── */}
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
            🔬
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Storm Lab & Inundation Scenario Modeling
              </h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', fontSize: '10px' }}
              >
                Interactive Sandbox
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Experiment with extreme cloudbursts, adjust municipal drainage efficiency, block stormwater channels, and observe dynamic hydraulic discharge curves in real time.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('map')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-end md:self-auto shrink-0"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}
        >
          <span>View on Live Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* ─── Grid: Control Panel (Left) & Hydrograph Charts (Right) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Storm Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <ControlPanel
            config={config}
            onConfigChange={onConfigChange}
            emergencyMode={emergencyMode}
            onToggleEmergencyMode={onToggleEmergencyMode}
            blockedCellsCount={blockedCellsCount}
            onResetBlockedChannels={onResetBlockedChannels}
            isSimulating={isSimulating}
            onStartDemoMode={onStartDemoMode}
            isDemoMode={isDemoMode}
          />
        </div>

        {/* Right Column: Scenario Comparison & Hydrograph (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Scenario Comparison Cards */}
          <ScenarioComparison
            scenarios={scenarios}
            isLoading={isLoadingScenarios}
            onApplyScenario={(scenario) =>
              onConfigChange({
                rainfallIntensity: scenario.rainfallIntensity,
                drainageEfficiency: scenario.drainageEfficiency,
              })
            }
          />

          {/* Hydrograph Charts */}
          <Charts
            timeline={timeline}
            currentStep={currentStep}
            rainfallIntensity={config.rainfallIntensity}
            rainfallDuration={config.rainfallDuration}
            onSeek={onSeek}
          />
        </div>
      </div>
    </div>
  );
};

export default StormLabView;
