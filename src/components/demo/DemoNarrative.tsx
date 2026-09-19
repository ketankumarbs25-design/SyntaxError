/**
 * FLOWSHIELD — DemoNarrative (Simplified)
 *
 * Simple phase descriptions in plain English — no tactical/military jargon.
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
  let emoji = '🌤️';
  let title = '';
  let desc = '';
  let borderColor = 'border-slate-700/50';

  if (time < 15) {
    emoji = '🌧️';
    title = 'Rain is starting';
    desc = 'A heavy storm has begun (80 mm/hr). The ground is absorbing the first rainfall — all zones are currently safe.';
    borderColor = 'border-emerald-500/30';
  } else if (time < 35) {
    emoji = '💧';
    title = 'Water is collecting';
    desc = 'The soil can\'t absorb all the rain anymore. Water is flowing downhill into the lower areas of the terrain.';
    borderColor = 'border-cyan-500/30';
  } else if (time < 60) {
    emoji = '⚠️';
    title = 'Warning zones appearing';
    desc = `${warningCount} zone${warningCount !== 1 ? 's' : ''} have reached warning levels. Water is getting close to dangerous depths in low-lying areas.`;
    borderColor = 'border-amber-500/30';
  } else if (time <= rainfallDuration) {
    emoji = '🚨';
    title = 'Flooding detected!';
    desc = `${criticalCount} zone${criticalCount !== 1 ? 's' : ''} are now flooding. Water has exceeded safe limits. The simulation shows how water spreads between zones.`;
    borderColor = 'border-red-500/30';
  } else {
    emoji = '🌈';
    title = 'Storm is over — water draining';
    desc = 'Rain has stopped. Water is slowly draining away through the drainage system. Watch the flood zones recover.';
    borderColor = 'border-purple-500/30';
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full p-4 rounded-2xl bg-slate-900/80 border ${borderColor} shadow-xl backdrop-blur-md`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{emoji}</span>
            <div>
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                🎬 Demo Mode
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{title}</h4>
            </div>
          </div>

          <button
            onClick={onExit}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-colors border border-slate-700/40"
          >
            ✕ Exit Demo
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {desc}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};
