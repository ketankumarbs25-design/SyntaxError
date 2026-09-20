import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WaterForecast } from '../../api/types';
import { formatIST } from '../../api/status';
import { useI18n } from '../../i18n';

interface ForecastTableProps {
  forecasts: WaterForecast[];
}

export const ForecastTable: React.FC<ForecastTableProps> = ({ forecasts }) => {
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          {t.forecastTableTitle}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Hourly Hydraulic Modeling
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-2.5 px-3">Valid Date &amp; Time (IST)</th>
              <th className="py-2.5 px-3">Predicted Level</th>
              <th className="py-2.5 px-3">Predicted Inflow</th>
              <th className="py-2.5 px-3">Trend</th>
              <th className="py-2.5 px-3">Flood Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {forecasts.slice(0, 12).map((fc) => {
              let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
              if (fc.status === 'Above normal') {
                badgeColor = 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200';
              } else if (fc.status === 'Severe') {
                badgeColor = 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200';
              } else if (fc.status === 'Extreme') {
                badgeColor = 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200';
              }

              return (
                <tr key={fc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {formatIST(fc.forecastTime)}
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                    {fc.predictedLevel.toFixed(2)} m
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {fc.predictedInflow > 0 ? `${fc.predictedInflow.toLocaleString()} cumec` : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      {fc.trend === 'Rising' ? (
                        <span className="text-red-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Rising
                        </span>
                      ) : fc.trend === 'Falling' ? (
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
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                      {fc.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
