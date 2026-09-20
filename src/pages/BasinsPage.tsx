import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, ArrowRight, Loader2 } from 'lucide-react';
import { getStations, aggregateBasins } from '../api/adapter';
import { useI18n } from '../i18n';

export const BasinsPage: React.FC = () => {
  const { language, t } = useI18n();

  const { data: stations = [], isLoading } = useQuery({
    queryKey: ['stations'],
    queryFn: getStations,
    refetchInterval: 3 * 60 * 1000,
  });

  const basins = aggregateBasins(stations);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--live)] animate-spin" />
        <p className="text-xs font-medium text-[var(--text-muted)]">
          Loading river basins summary...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
          {t.navBasins}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Aggregated flood risk, gauging telemetry, and reservoir storage across India's major river basins
        </p>
      </div>

      {/* Basins Grid with Framer Motion Stagger and Hover Lift */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {basins.map((basin, index) => {
          const hasExtreme = basin.extremeCount > 0;
          const hasSevere = basin.severeCount > 0;
          const hasAbove = basin.aboveNormalCount > 0;

          let riskBadgeBg = 'var(--normal)';
          let riskBadgeText = '#FFFFFF';
          let riskLabel = 'Normal status';

          if (hasExtreme) {
            riskBadgeBg = 'var(--danger)';
            riskBadgeText = '#FFFFFF';
            riskLabel = 'Extreme flood warning';
          } else if (hasSevere) {
            riskBadgeBg = 'var(--warning)';
            riskBadgeText = '#FFFFFF';
            riskLabel = 'Severe flood situation';
          } else if (hasAbove) {
            riskBadgeBg = 'var(--watch)';
            riskBadgeText = '#0B1F33';
            riskLabel = 'Above normal flood';
          }

          // Proportional percentages for stacked bar
          const total = Math.max(basin.totalStations, 1);
          const normPct = (basin.normalCount / total) * 100;
          const abovePct = (basin.aboveNormalCount / total) * 100;
          const severePct = (basin.severeCount / total) * 100;
          const extremePct = (basin.extremeCount / total) * 100;

          return (
            <motion.div
              key={basin.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: Math.min(index * 0.04, 0.4),
                ease: 'easeOut',
              }}
              whileHover={{ y: -2 }}
              className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)] shadow-xs flex flex-col justify-between gap-4 transition-colors hover:border-[var(--live)]/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--live)] flex items-center justify-center shrink-0 border border-[var(--border)]">
                      <Waves className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-[var(--text)]">
                        {language === 'hi' ? basin.hindiName : `${basin.name} basin`}
                      </h3>
                      <span className="text-[11px] text-[var(--text-muted)] font-normal">
                        {basin.totalStations} monitoring stations
                      </span>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: riskBadgeBg,
                      color: riskBadgeText,
                    }}
                  >
                    {riskLabel}
                  </span>
                </div>

                {/* Major Tributary Rivers */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {basin.majorRivers.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--text-muted)] text-[11px] font-normal"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Proportional Stacked Status Bar */}
              <div className="space-y-2.5 pt-3 border-t border-[var(--border)] text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
                    <span>Station severity breakdown</span>
                    <span className="font-mono tabular-nums">{basin.totalStations} stations</span>
                  </div>

                  {/* The Proportional Stacked Bar */}
                  <div
                    className="w-full h-2.5 rounded-full bg-[var(--surface-2)] overflow-hidden flex shadow-inner"
                    title={`Normal: ${basin.normalCount}, Above: ${basin.aboveNormalCount}, Severe: ${basin.severeCount}, Extreme: ${basin.extremeCount}`}
                  >
                    {normPct > 0 && (
                      <div
                        style={{ width: `${normPct}%`, backgroundColor: 'var(--normal)' }}
                        className="h-full transition-all"
                      />
                    )}
                    {abovePct > 0 && (
                      <div
                        style={{ width: `${abovePct}%`, backgroundColor: 'var(--watch)' }}
                        className="h-full transition-all"
                      />
                    )}
                    {severePct > 0 && (
                      <div
                        style={{ width: `${severePct}%`, backgroundColor: 'var(--warning)' }}
                        className="h-full transition-all"
                      />
                    )}
                    {extremePct > 0 && (
                      <div
                        style={{ width: `${extremePct}%`, backgroundColor: 'var(--danger)' }}
                        className="h-full transition-all"
                      />
                    )}
                  </div>
                </div>

                {/* Legend Below Stacked Bar with High-Contrast Tokens */}
                <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] pt-1">
                  <div className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text)]">
                    <span className="text-[10px] text-[var(--text-muted)] block font-sans">
                      Normal
                    </span>
                    <span className="font-medium">{basin.normalCount}</span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text)]">
                    <span className="text-[10px] text-[var(--text-muted)] block font-sans">
                      Above
                    </span>
                    <span className="font-medium">{basin.aboveNormalCount}</span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text)]">
                    <span className="text-[10px] text-[var(--text-muted)] block font-sans">
                      Severe
                    </span>
                    <span className="font-medium">{basin.severeCount}</span>
                  </div>

                  <div className="p-1.5 rounded-lg bg-[var(--surface-2)] text-[var(--text)]">
                    <span className="text-[10px] text-[var(--text-muted)] block font-sans">
                      Extreme
                    </span>
                    <span className="font-medium">{basin.extremeCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                  <span>Peak threat station:</span>
                  <span className="font-medium text-[var(--text)]">
                    {basin.highestRiskStation || 'None'}
                  </span>
                </div>
              </div>

              {/* View Stations Action Button */}
              <NavLink
                to={`/?basin=${encodeURIComponent(basin.name)}`}
                className="w-full py-2 px-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <span>View stations on map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BasinsPage;
