import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus, ShieldAlert } from 'lucide-react';
import type { Station } from '../../api/types';
import { useI18n } from '../../i18n';

interface NeedsAttentionListProps {
  stations: Station[];
}

export const NeedsAttentionList: React.FC<NeedsAttentionListProps> = ({ stations }) => {
  const { language, t } = useI18n();

  // Filter stations needing attention: Extreme or Severe, or Rising while Above normal
  const attentionStations = stations
    .filter(
      (s) =>
        s.status === 'Extreme' ||
        s.status === 'Severe' ||
        (s.status === 'Above normal' && s.trend === 'Rising')
    )
    .sort((a, b) => {
      // Prioritize Extreme, then Severe, then highest delta to danger
      const rank = (st: Station) => (st.status === 'Extreme' ? 3 : st.status === 'Severe' ? 2 : 1);
      if (rank(b) !== rank(a)) return rank(b) - rank(a);
      return b.deltaToDangerM - a.deltaToDangerM;
    });

  if (attentionStations.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          ✓ All monitoring stations currently operating within normal parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            {t.needsAttention} ({attentionStations.length})
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
          Live Threat Level
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
        {attentionStations.map((stn) => {
          const isExtreme = stn.status === 'Extreme';
          const isSevere = stn.status === 'Severe';

          return (
            <NavLink
              key={stn.id}
              to={`/stations/${stn.id}`}
              className={`block p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer group ${
                isExtreme
                  ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 hover:border-red-400'
                  : isSevere
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-400'
                  : 'bg-yellow-50/40 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50 hover:border-yellow-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {language === 'hi' && stn.hindiName ? stn.hindiName : stn.name}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isExtreme
                          ? 'bg-red-600 text-white animate-pulse'
                          : isSevere
                          ? 'bg-orange-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {stn.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    River {stn.river} • {stn.state} ({stn.basin} Basin)
                  </p>
                </div>

                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>

              {/* Data Row: Current Level vs Danger Level */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Level / Danger</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                    {stn.currentLevel.toFixed(2)}m / {stn.dangerLevel.toFixed(2)}m
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Threat Delta</span>
                  <span
                    className={`font-black text-xs ${
                      stn.deltaToDangerM >= 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {stn.deltaToDangerM >= 0
                      ? `+${stn.deltaToDangerM.toFixed(2)}m above DL`
                      : `${Math.abs(stn.deltaToDangerM).toFixed(2)}m to DL`}
                  </span>
                </div>

                {/* Trend icon */}
                <div className="flex items-center gap-1 font-semibold text-[11px]">
                  {stn.trend === 'Rising' ? (
                    <span className="text-red-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Rising
                    </span>
                  ) : stn.trend === 'Falling' ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Falling
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-0.5">
                      <Minus className="w-3.5 h-3.5" />
                      Steady
                    </span>
                  )}
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
