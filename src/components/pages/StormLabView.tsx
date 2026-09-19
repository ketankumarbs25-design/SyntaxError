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
        className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/40 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-blue-500/10">
            🔬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Storm Lab & Inundation Scenario Modeling
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Interactive Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Experiment with extreme cloudbursts, adjust municipal drainage efficiency, block stormwater channels, and observe dynamic hydraulic discharge curves in real time.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('map')}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-end md:self-auto shrink-0"
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
