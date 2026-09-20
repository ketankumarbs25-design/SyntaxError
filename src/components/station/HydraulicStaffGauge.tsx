import React from 'react';
import type { Station } from '../../api/types';
import { useI18n } from '../../i18n';

interface HydraulicStaffGaugeProps {
  station: Station;
}

export const HydraulicStaffGauge: React.FC<HydraulicStaffGaugeProps> = ({ station }) => {
  const { t } = useI18n();

  const { currentLevel, warningLevel, dangerLevel, hfl } = station;

  // Gauge scale: from minLevel to maxScale
  const minScale = Math.max(0, Math.floor(warningLevel - 4));
  const maxScale = Math.ceil((hfl || dangerLevel) + 2);
  const totalRange = maxScale - minScale || 1;

  // Percentage height helper (0 to 100%)
  const getPercent = (level: number) => {
    const clamped = Math.min(Math.max(level, minScale), maxScale);
    return ((clamped - minScale) / totalRange) * 100;
  };

  const currentPercent = getPercent(currentLevel);
  const warningPercent = getPercent(warningLevel);
  const dangerPercent = getPercent(dangerLevel);
  const hflPercent = hfl ? getPercent(hfl) : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          {t.gaugeTitle}
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          Scale: {minScale}m – {maxScale}m
        </span>
      </div>

      {/* Main Staff Gauge Column */}
      <div className="w-full flex items-center justify-center gap-6 py-4">
        {/* Left Ticks & Labels */}
        <div className="relative h-80 w-28 text-xs font-mono select-none">
          {/* HFL Indicator */}
          {hflPercent !== null && (
            <div
              className="absolute right-0 flex items-center gap-1.5 -translate-y-1/2"
              style={{ bottom: `${hflPercent}%` }}
            >
              <div className="text-right">
                <span className="block font-black text-red-600 dark:text-red-400 text-[11px] uppercase">
                  HFL
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                  {hfl.toFixed(2)}m
                </span>
              </div>
              <div className="w-3 h-0.5 bg-red-600" />
            </div>
          )}

          {/* Danger Level Indicator */}
          <div
            className="absolute right-0 flex items-center gap-1.5 -translate-y-1/2"
            style={{ bottom: `${dangerPercent}%` }}
          >
            <div className="text-right">
              <span className="block font-black text-orange-600 dark:text-orange-400 text-[11px] uppercase">
                Danger
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                {dangerLevel.toFixed(2)}m
              </span>
            </div>
            <div className="w-3 h-0.5 bg-orange-600" />
          </div>

          {/* Warning Level Indicator */}
          <div
            className="absolute right-0 flex items-center gap-1.5 -translate-y-1/2"
            style={{ bottom: `${warningPercent}%` }}
          >
            <div className="text-right">
              <span className="block font-black text-amber-600 dark:text-amber-400 text-[11px] uppercase">
                Warning
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                {warningLevel.toFixed(2)}m
              </span>
            </div>
            <div className="w-3 h-0.5 bg-amber-500" />
          </div>

          {/* Base Level */}
          <div className="absolute right-0 bottom-0 flex items-center gap-1.5 translate-y-1/2">
            <span className="text-[10px] text-slate-400">{minScale}m</span>
            <div className="w-3 h-0.5 bg-slate-300" />
          </div>
        </div>

        {/* Center Vertical Gauge Tube */}
        <div className="relative h-80 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl border-4 border-slate-300 dark:border-slate-700 shadow-inner overflow-hidden flex flex-col justify-end">
          {/* Water Fill with Gradient & Wave Animation */}
          <div
            className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 transition-all duration-1000 ease-out relative gauge-animated-fill"
            style={{ height: `${currentPercent}%` }}
          >
            {/* Surface Ripple Effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 animate-pulse" />
          </div>

          {/* Threshold Overlays on Tube */}
          <div
            className="absolute left-0 right-0 h-0.5 bg-amber-500/80 border-b border-dashed border-white"
            style={{ bottom: `${warningPercent}%` }}
          />
          <div
            className="absolute left-0 right-0 h-0.5 bg-orange-600/90 border-b border-dashed border-white"
            style={{ bottom: `${dangerPercent}%` }}
          />
          {hflPercent !== null && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-red-600 border-b border-dashed border-white"
              style={{ bottom: `${hflPercent}%` }}
            />
          )}

          {/* Gauge Measuring Ticks */}
          <div className="absolute inset-y-0 left-1 w-2 flex flex-col justify-between py-2 pointer-events-none opacity-40">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-2 h-0.5 bg-black dark:bg-white" />
            ))}
          </div>
        </div>

        {/* Right: Current Level Pointer & Status Callout */}
        <div className="relative h-80 w-32 select-none">
          <div
            className="absolute left-0 flex items-center gap-2 -translate-y-1/2 transition-all duration-700"
            style={{ bottom: `${currentPercent}%` }}
          >
            <div className="w-4 h-0.5 bg-blue-600" />
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md min-w-[85px]">
              <span className="block text-[9px] uppercase tracking-wider font-bold opacity-80">
                CURRENT
              </span>
              <span className="font-extrabold text-sm sm:text-base leading-none block">
                {currentLevel.toFixed(2)} m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-slate-400 text-[10px] block">Warning Mark</span>
          <span className="font-bold text-amber-600">{warningLevel.toFixed(2)} m</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Danger Mark</span>
          <span className="font-bold text-orange-600">{dangerLevel.toFixed(2)} m</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">HFL Record</span>
          <span className="font-bold text-red-600">{hfl.toFixed(2)} m</span>
        </div>
      </div>
    </div>
  );
};
