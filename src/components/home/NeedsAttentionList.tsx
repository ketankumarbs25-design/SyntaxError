import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 text-center">
        <p className="text-xs font-medium text-[var(--normal)]">
          All monitoring stations currently operating within normal parameters.
        </p>
      </div>
    );
  }

  const hasExtreme = attentionStations.some((s) => s.status === 'Extreme');

  return (
    <div
      className="rounded-xl p-4 sm:p-5 border shadow-sm flex flex-col h-full"
      style={{
        background: hasExtreme ? 'rgba(198,40,40,0.07)' : 'var(--surface)',
        borderColor: hasExtreme ? 'rgba(198,40,40,0.45)' : 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center border"
            style={{
              background: hasExtreme ? 'rgba(198,40,40,0.18)' : 'var(--surface-2)',
              borderColor: hasExtreme ? 'rgba(198,40,40,0.5)' : 'var(--border)',
              color: 'var(--danger)',
            }}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-semibold text-sm text-[var(--text)]">
            {t.needsAttention} ({attentionStations.length})
          </h2>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{
            background: hasExtreme ? 'rgba(198,40,40,0.2)' : 'rgba(240,138,36,0.15)',
            color: hasExtreme ? 'var(--danger)' : 'var(--warning)',
            border: `1px solid ${hasExtreme ? 'rgba(198,40,40,0.4)' : 'rgba(240,138,36,0.35)'}`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: hasExtreme ? 'var(--danger)' : 'var(--warning)' }} />
          {hasExtreme ? 'Extreme threat' : 'Active warnings'}
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1.5 custom-scrollbar">
        {attentionStations.map((stn, index) => {
          const isExtreme = stn.status === 'Extreme';
          const isSevere = stn.status === 'Severe';

          return (
            <motion.div
              key={stn.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
            >
              <NavLink
                to={`/stations/${stn.id}`}
                className="block p-3 rounded-xl border transition-all hover:translate-y-[-1px] cursor-pointer group"
                style={{
                  background: isExtreme
                    ? 'rgba(198,40,40,0.1)'
                    : isSevere
                    ? 'rgba(240,138,36,0.08)'
                    : 'var(--surface-2)',
                  borderColor: isExtreme
                    ? 'rgba(198,40,40,0.55)'
                    : isSevere
                    ? 'rgba(240,138,36,0.45)'
                    : 'rgba(242,194,48,0.4)',
                  boxShadow: isExtreme
                    ? '0 0 0 1px rgba(198,40,40,0.2)'
                    : isSevere
                    ? '0 0 0 1px rgba(240,138,36,0.15)'
                    : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs text-[var(--text)] group-hover:text-[var(--live)] transition-colors">
                        {language === 'hi' && stn.hindiName ? stn.hindiName : stn.name}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md text-white whitespace-nowrap"
                        style={{
                          backgroundColor: isExtreme
                            ? 'var(--danger)'
                            : isSevere
                            ? 'var(--warning)'
                            : 'var(--watch)',
                          color: !isExtreme && !isSevere ? '#0B1F33' : '#FFFFFF',
                        }}
                      >
                        {stn.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      River {stn.river} • {stn.state} ({stn.basin} basin)
                    </p>
                  </div>

                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--live)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                </div>

                {/* Data Row: Current Level vs Danger Level */}
                <div className="mt-2.5 pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-[var(--text-muted)] block">Level / danger</span>
                    <span className="font-mono text-xs text-[var(--text)] tabular-nums">
                      {stn.currentLevel.toFixed(2)}m / {stn.dangerLevel.toFixed(2)}m
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[var(--text-muted)] block">Threat delta</span>
                    <span
                      className="font-mono text-xs tabular-nums font-semibold"
                      style={{
                        color: stn.deltaToDangerM >= 0 ? 'var(--danger)' : 'var(--warning)',
                      }}
                    >
                      {stn.deltaToDangerM >= 0
                        ? `+${stn.deltaToDangerM.toFixed(2)}m above DL`
                        : `${Math.abs(stn.deltaToDangerM).toFixed(2)}m to DL`}
                    </span>
                  </div>

                  {/* Trend icon */}
                  <div className="flex items-center gap-1 font-medium text-[11px]">
                    {stn.trend === 'Rising' ? (
                      <span className="text-[var(--danger)] flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        Rising
                      </span>
                    ) : stn.trend === 'Falling' ? (
                      <span className="text-[var(--normal)] flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        Falling
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)] flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />
                        Steady
                      </span>
                    )}
                  </div>
                </div>
              </NavLink>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NeedsAttentionList;
