import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Waves } from 'lucide-react';
import type { Station } from '../../api/types';
import { useI18n } from '../../i18n';

interface SameRiverStationsProps {
  currentStation: Station;
  allStations: Station[];
}

export const SameRiverStations: React.FC<SameRiverStationsProps> = ({
  currentStation,
  allStations,
}) => {
  const { language, t } = useI18n();

  // Filter stations along the same river (excluding current station)
  const sameRiverList = allStations
    .filter(
      (s) =>
        s.river.toLowerCase() === currentStation.river.toLowerCase() &&
        s.id !== currentStation.id
    )
    .sort((a, b) => b.elevationM - a.elevationM); // Upstream to downstream

  if (sameRiverList.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            {t.sameRiverTitle} ({currentStation.river})
          </h3>
        </div>
        <span className="text-xs text-slate-400">Upstream → Downstream Chain</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sameRiverList.map((stn) => {
          let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300';
          if (stn.status === 'Above normal') badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300';
          else if (stn.status === 'Severe') badgeColor = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300';
          else if (stn.status === 'Extreme') badgeColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300';

          return (
            <NavLink
              key={stn.id}
              to={`/stations/${stn.id}`}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 transition-all hover:shadow-xs flex flex-col justify-between gap-2 group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] text-slate-400">{stn.district}, {stn.state}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeColor}`}>
                    {stn.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {language === 'hi' && stn.hindiName ? stn.hindiName : stn.name}
                </h4>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {stn.currentLevel.toFixed(2)} m
                </span>
                <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
