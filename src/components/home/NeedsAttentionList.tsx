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
    <div className="bg-[var(--surface)] rounded-xl p-4 sm:p-5 border border-[var(--border)] shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg)] text-[var(--level-danger)] flex items-center justify-center border border-[var(--border)]">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-bold text-sm text-[var(--text)]">
            {t.needsAttention} ({attentionStations.length})
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-[var(--level-danger)]">
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
              className={`block p-3 rounded-lg border transition-all hover:brightness-110 cursor-pointer group bg-[var(--bg)] ${
                isExtreme
                  ? 'border-[var(--level-danger)]/70 hover:border-[var(--level-danger)]'
                  : isSevere
                  ? 'border-[var(--level-warning)]/70 hover:border-[var(--level-warning)]'
                  : 'border-[var(--level-watch)]/70 hover:border-[var(--level-watch)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--live)] transition-colors">
                      {language === 'hi' && stn.hindiName ? stn.hindiName : stn.name}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white ${
                        isExtreme
                          ? 'bg-[var(--level-danger)] animate-pulse'
                          : isSevere
                          ? 'bg-[var(--level-warning)]'
                          : 'bg-[var(--level-watch)] text-slate-900'
                      }`}
                    >
                      {stn.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    River {stn.river} • {stn.state} ({stn.basin} Basin)
                  </p>
                </div>

                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--live)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>

              {/* Data Row: Current Level vs Danger Level */}
              <div className="mt-2.5 pt-2 border-t border-[var(--border)]/70 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">Level / Danger</span>
                  <span className="font-extrabold text-[var(--text)] text-xs">
                    {stn.currentLevel.toFixed(2)}m / {stn.dangerLevel.toFixed(2)}m
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-muted)] block">Threat Delta</span>
                  <span
                    className={`font-black text-xs ${
                      stn.deltaToDangerM >= 0
                        ? 'text-[var(--level-danger)]'
                        : 'text-[var(--level-warning)]'
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
                    <span className="text-[var(--level-danger)] flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Rising
                    </span>
                  ) : stn.trend === 'Falling' ? (
                    <span className="text-[var(--level-normal)] flex items-center gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Falling
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)] flex items-center gap-0.5">
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
