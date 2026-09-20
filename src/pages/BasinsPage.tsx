import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import {
  Waves,
  ArrowRight,
  Loader2,
} from 'lucide-react';
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
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading river basins summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.navBasins}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Aggregated flood risk, gauging telemetry, and reservoir storage across India's major river basins.
        </p>
      </div>

      {/* Basins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {basins.map((basin) => {
          const hasExtreme = basin.extremeCount > 0;
          const hasSevere = basin.severeCount > 0;
          const hasAbove = basin.aboveNormalCount > 0;

          let riskBadge = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
          let riskLabel = 'Normal Status';

          if (hasExtreme) {
            riskBadge = 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 animate-pulse';
            riskLabel = 'Extreme Flood Warning';
          } else if (hasSevere) {
            riskBadge = 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200';
            riskLabel = 'Severe Flood Situation';
          } else if (hasAbove) {
            riskBadge = 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200';
            riskLabel = 'Above Normal Flood';
          }

          return (
            <div
              key={basin.name}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <Waves className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {language === 'hi' ? basin.hindiName : `${basin.name} Basin`}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {basin.totalStations} Monitoring Stations
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${riskBadge}`}>
                    {riskLabel}
                  </span>
                </div>

                {/* Major Tributary Rivers */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {basin.majorRivers.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Station Breakdown Bar */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="grid grid-cols-4 gap-1 text-center font-bold">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl text-emerald-600">
                    <span className="text-[10px] text-slate-400 block font-normal">Normal</span>
                    {basin.normalCount}
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/40 p-2 rounded-xl text-yellow-600">
                    <span className="text-[10px] text-slate-400 block font-normal">Above</span>
                    {basin.aboveNormalCount}
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950/40 p-2 rounded-xl text-orange-600">
                    <span className="text-[10px] text-slate-400 block font-normal">Severe</span>
                    {basin.severeCount}
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/40 p-2 rounded-xl text-red-600">
                    <span className="text-[10px] text-slate-400 block font-normal">Extreme</span>
                    {basin.extremeCount}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>High Risk Station:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {basin.highestRiskStation || 'None'}
                  </span>
                </div>
              </div>

              <NavLink
                to={`/?basin=${encodeURIComponent(basin.name)}`}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Stations on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          );
        })}
      </div>
    </div>
  );
};
