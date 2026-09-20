/**
 * FLOWSHIELD — Hydrology Cycle Micro-Animation
 * 
 * Subtle animated visual representing:
 * 1. Rain Precipitation (smooth falling rain streams)
 * 2. Water Accumulation (catchment basin with gentle fluid oscillation)
 * 3. Flood-Risk Detection (radiating telemetry sensor pulse)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CloudRain, Waves, ShieldCheck } from 'lucide-react';

export const HydrologyCycleAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);

  // Cycle automatically every 3.6 seconds through the 3 phases
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`w-full max-w-lg bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 select-none ${className}`}>
      {/* Animated Graphic Stage */}
      <div className="relative h-44 w-full rounded-2xl bg-gradient-to-b from-blue-50/50 via-slate-50/40 to-blue-50/60 border border-slate-100 overflow-hidden flex flex-col justify-between p-4">
        {/* Sky / Rain Layer */}
        <div className="relative h-16 w-full flex items-center justify-around px-6 overflow-hidden">
          {/* Animated Falling Rain Droplets */}
          {[12, 28, 44, 60, 76, 92].map((leftPercent, idx) => (
            <motion.div
              key={idx}
              className="w-0.5 rounded-full bg-blue-400"
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                height: 12,
              }}
              animate={{
                y: [0, 48],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: idx * 0.18,
                ease: 'linear',
              }}
            />
          ))}

          {/* Cloud Formation Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-blue-100 shadow-xs text-xs font-semibold text-blue-600">
            <CloudRain className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Precipitation (Open-Meteo)</span>
          </div>
        </div>

        {/* Catchment Basin / Water Accumulation Curve */}
        <div className="relative h-16 w-full flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 60" preserveAspectRatio="none">
            {/* Water Fill */}
            <motion.path
              d="M 0,35 Q 100,25 200,35 T 400,35 L 400,60 L 0,60 Z"
              fill="url(#basinWaterGrad)"
              animate={{
                d: [
                  'M 0,35 Q 100,28 200,35 T 400,35 L 400,60 L 0,60 Z',
                  'M 0,32 Q 100,38 200,32 T 400,32 L 400,60 L 0,60 Z',
                  'M 0,35 Q 100,28 200,35 T 400,35 L 400,60 L 0,60 Z',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <defs>
              <linearGradient id="basinWaterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Early Warning Detection Node Pulse in Center */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <span className="w-9 h-9 rounded-full bg-blue-500/20 animate-ping absolute" />
              <span className="w-6 h-6 rounded-full bg-blue-500/30 animate-pulse absolute" />
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md z-10">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-900 bg-white/90 px-2 py-0.5 rounded-full border border-blue-200 mt-1 shadow-xs">
              Catchment Head
            </span>
          </div>
        </div>
      </div>

      {/* 3 Step Sequence Indicators */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {/* Step 1 */}
        <div
          onClick={() => setActiveStep(0)}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            activeStep === 0
              ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-xs'
              : 'bg-white/60 border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 font-bold mb-0.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>1. Rain</span>
          </div>
          <p className="text-[10px] text-slate-400">Atmospheric inflow</p>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => setActiveStep(1)}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            activeStep === 1
              ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-xs'
              : 'bg-white/60 border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 font-bold mb-0.5">
            <Waves className="w-3.5 h-3.5 text-blue-500" />
            <span>2. Accumulation</span>
          </div>
          <p className="text-[10px] text-slate-400">2D head accumulation</p>
        </div>

        {/* Step 3 */}
        <div
          onClick={() => setActiveStep(2)}
          className={`p-2 rounded-2xl border transition-all cursor-pointer ${
            activeStep === 2
              ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-xs'
              : 'bg-white/60 border-slate-100 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 font-bold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Detection</span>
          </div>
          <p className="text-[10px] text-slate-400">Risk classification</p>
        </div>
      </div>
    </div>
  );
};
