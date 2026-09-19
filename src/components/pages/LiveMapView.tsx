import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertTriangle, ArrowRight, CloudSun, FlaskConical, LifeBuoy } from 'lucide-react';
import type { SimConfig, SimState, CellState } from '../../sim/types';
import { LiveStats } from '@/components/stats/LiveStats';
import { FloodGrid } from '../grid/FloodGrid';
import { TimelineControls } from '../playback/TimelineControls';
import { DemoNarrative } from '../demo/DemoNarrative';
import type { NavTabId } from '../nav/Navbar';

interface LiveMapViewProps {
  config: SimConfig;
  currentState: SimState;
  timeline: SimState[];
  currentStep: number;
  rainfallDuration: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  blockedCells: Set<string>;
  selectedCellId: string | null;
  emergencyMode: boolean;
  isDemoMode: boolean;
  onCellClick: (cell: CellState) => void;
  onExitDemoMode: () => void;
  onNavigateTab: (tab: NavTabId) => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  config,
  currentState,
  timeline,
  currentStep,
  rainfallDuration,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onReset,
  onSeek,
  onSpeedChange,
  blockedCells,
  selectedCellId,
  emergencyMode,
  isDemoMode,
  onCellClick,
  onExitDemoMode,
  onNavigateTab,
}) => {
  const { safeCells, warningCells, criticalCells, maxWater, affectedPopulation } = currentState.stats;
  const totalCells = config.rows * config.cols;
  const isAllSafe = criticalCells === 0 && warningCells === 0;

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto">

      {/* ─── City Status Hero ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${isAllSafe ? 'var(--border-subtle)' : 'var(--status-crit-border)'}`,
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
        className="md:flex-row md:items-center md:justify-between shadow-sm backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          {/* Status icon — no animate-pulse competing with data */}
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '0.75rem',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isAllSafe ? 'var(--status-safe-subtle)' : 'var(--status-crit-subtle)',
              border: `1px solid ${isAllSafe ? 'var(--status-safe-border)' : 'var(--status-crit-border)'}`,
            }}
          >
            {isAllSafe
              ? <ShieldCheck className="w-5 h-5" style={{ color: 'var(--status-safe)' }} />
              : <AlertTriangle className="w-5 h-5" style={{ color: 'var(--status-crit)' }} />
            }
          </div>

          <div>
            {/* Primary heading + single status badge (dot OR badge, not both) */}
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {isAllSafe
                  ? 'Bengaluru Urban Catchment — Safe Drainage'
                  : `Active Inundation Alert — ${criticalCells} Critical Sector${criticalCells !== 1 ? 's' : ''}`
                }
              </h2>
              {/* Single badge — no redundant dot alongside text */}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: isAllSafe ? 'var(--status-safe)' : 'var(--status-crit)',
                  background: isAllSafe ? 'var(--status-safe-subtle)' : 'var(--status-crit-subtle)',
                  border: `1px solid ${isAllSafe ? 'var(--status-safe-border)' : 'var(--status-crit-border)'}`,
                }}
              >
                {isAllSafe ? 'All Clear' : 'Inundation Active'}
              </span>
            </div>

            {/* Real bound data in the subtext, not static copy */}
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {isAllSafe
                ? `${safeCells} of ${totalCells} sectors clear · Peak depth ${maxWater.toFixed(2)}m · Surface runoff within culvert capacity`
                : `${affectedPopulation.toLocaleString()} residents in ${warningCells + criticalCells} elevated sectors · Peak depth ${maxWater.toFixed(2)}m · Monitor evacuation corridors`
              }
            </p>
          </div>
        </div>

        {/* Navigation shortcuts */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => onNavigateTab('weather')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <CloudSun className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>Radar & Weather</span>
          </button>
          <button
            onClick={() => onNavigateTab('safety')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent)',
            }}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Citizen Safety</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* ─── Demo Narrative (When Active) ───────────────────────────────────── */}
      {isDemoMode && (
        <DemoNarrative
          time={currentState.time}
          rainfallDuration={config.rainfallDuration}
          criticalCount={currentState.stats.criticalCells}
          warningCount={currentState.stats.warningCells}
          onExit={onExitDemoMode}
        />
      )}

      {/* ─── Live Metrics Summary Bar ─────────────────────────────────────── */}
      <LiveStats
        stats={currentState.stats}
        totalCells={totalCells}
      />

      {/* ─── Hydrodynamic Flood Map Grid ──────────────────────────────────── */}
      <div
        className="flex flex-col items-center justify-center p-3 rounded-2xl shadow-xl backdrop-blur-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-full flex items-center justify-between px-2 pb-2 mb-2 text-xs"
          style={{ borderBottom: '1px solid var(--border-strong)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>8×8 Catchment Grid</span>
            <span style={{ color: 'var(--text-faint)' }}>·</span>
            <span style={{ color: 'var(--text-muted)' }}>Click any sector to inspect depth & elevation</span>
          </div>
          <div className="hidden sm:flex items-center gap-3" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--status-safe)', opacity: 0.5 }} /> Safe (&lt;0.15m)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--status-warn)', opacity: 0.65 }} /> Warning (&gt;0.15m)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--status-crit)', opacity: 0.85 }} /> Critical (&gt;0.5m)
            </span>
          </div>
        </div>

        <FloodGrid
          cells={currentState.cells}
          rows={config.rows}
          cols={config.cols}
          blockedCells={blockedCells}
          selectedCellId={selectedCellId}
          emergencyMode={emergencyMode}
          onCellClick={onCellClick}
        />
      </div>

      {/* ─── Timeline Playback Controller ─────────────────────────────────── */}
      <TimelineControls
        currentStep={currentStep}
        totalSteps={timeline.length}
        currentTime={currentState.time}
        rainfallDuration={rainfallDuration}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onTogglePlay={onTogglePlay}
        onReset={onReset}
        onSeek={onSeek}
        onSpeedChange={onSpeedChange}
        currentState={currentState}
      />

      {/* ─── Bottom Navigation Shortcuts ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {[
          {
            tab: 'weather' as NavTabId,
            icon: <CloudSun className="w-4 h-4" style={{ color: 'var(--accent)' }} />,
            label: 'Real-time Weather',
            heading: 'BBC Weather & 7-Day Radar',
            body: 'Explore 24-hour rainfall curves, UV ratings, and air quality indices.',
          },
          {
            tab: 'storm-lab' as NavTabId,
            icon: <FlaskConical className="w-4 h-4" style={{ color: 'var(--accent)' }} />,
            label: 'Storm Lab',
            heading: 'Scenario Modeling & Drainage Stress',
            body: 'Simulate cloudbursts, test drainage failures, and inspect hydrograph curves.',
          },
          {
            tab: 'safety' as NavTabId,
            icon: <LifeBuoy className="w-4 h-4" style={{ color: 'var(--accent)' }} />,
            label: 'Citizen Safety',
            heading: 'Evacuation Routes & Hotline Directory',
            body: 'Find high-ground shelters, emergency checklists, and state disaster helplines.',
          },
        ].map(({ tab, icon, label, heading, body }) => (
          <div
            key={tab}
            onClick={() => onNavigateTab(tab)}
            className="group cursor-pointer p-3.5 rounded-2xl transition-all"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.border = '1px solid var(--accent-border)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.border = '1px solid var(--border-subtle)';
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                {icon} {label}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-faint)' }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{heading}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveMapView;
