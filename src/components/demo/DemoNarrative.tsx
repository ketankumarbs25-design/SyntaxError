/**
 * FLOWSHIELD — DemoNarrative
 *
 * Tactical narration HUD for the 90-second automated demo run.
 * Narrates the progression visibly from SAFE -> WARNING -> CRITICAL -> RECESSION.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DemoNarrativeProps {
  time: number;
  rainfallDuration: number;
  criticalCount: number;
  warningCount: number;
  onExit: () => void;
}

export const DemoNarrative: React.FC<DemoNarrativeProps> = ({
  time,
  rainfallDuration,
  criticalCount,
  warningCount,
  onExit,
}) => {
  // Determine narrative chapter
  let chapterTitle = '';
  let chapterDesc = '';
  let badgeColor = '';

  if (time < 15) {
    chapterTitle = 'Phase I: Precipitation Onset';
    chapterDesc = 'Heavy storm front arrives (80 mm/hr). Infiltration capacity absorbs initial rainfall; all sectors nominal and classified SAFE.';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (time < 35) {
    chapterTitle = 'Phase II: Topographic Basin Runoff';
    chapterDesc = 'Ground absorption rate reached. Hydraulic head gradient drives runoff into central basin. Lowest elevation cells begin accumulation.';
    badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  } else if (time < 60) {
    chapterTitle = 'Phase III: Warning Threshold Breached';
    chapterDesc = `${warningCount} sector(s) reach WARNING threshold (depth / critical >= 0.60). ETA algorithm identifies early flood arrival.`;
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (time <= rainfallDuration) {
    chapterTitle = 'Phase IV: Critical Inundation Event';
    chapterDesc = `CRITICAL breach (ratio >= 1.00) in ${criticalCount} sectors. Inter-cell Jacobi flow actively transferring flood volume across grid.`;
    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';
  } else {
    chapterTitle = 'Phase V: Recession & Channel Evacuation';
    chapterDesc = 'Precipitation ceased. Gravity-driven inter-cell flow and drainage networks slowly discharge standing volume.';
    badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapterTitle}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full mb-3 p-3 rounded-xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-[10px] font-telemetry tracking-widest uppercase font-bold text-cyan-400">
              TACTICAL NARRATIVE BRIEFING
            </span>
            <span className={`text-[9px] font-telemetry px-2 py-0.5 rounded-full border font-bold ${badgeColor}`}>
              {chapterTitle}
            </span>
          </div>

          <button
            onClick={onExit}
            className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            ✕ Exit Demo
          </button>
        </div>

        <p className="mt-1.5 text-xs font-telemetry text-slate-200 leading-relaxed">
          {chapterDesc}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
