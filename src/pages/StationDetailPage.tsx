import React from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Waves,
  MapPin,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { getStations, getStationObservations, getStationForecast } from '../api/adapter';
import { formatIST } from '../api/status';
import { HydraulicStaffGauge } from '../components/station/HydraulicStaffGauge';
import { HydrographChart } from '../components/station/HydrographChart';
import { ForecastTable } from '../components/station/ForecastTable';
import { SameRiverStations } from '../components/station/SameRiverStations';
import { useI18n } from '../i18n';

export const StationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useI18n();

  // Fetch all stations to locate current and sibling river stations
  const { data: stations = [], isLoading: isLoadingStations } = useQuery({
    queryKey: ['stations'],
    queryFn: getStations,
    refetchInterval: 3 * 60 * 1000,
  });

  const station = stations.find((s) => s.id === id) || stations[0];

  // Fetch observations & forecast for this station
  const { data: observations = [] } = useQuery({
    queryKey: ['observations', id],
    queryFn: () => getStationObservations(id || 'stn-01'),
    enabled: Boolean(id || stations.length),
    refetchInterval: 3 * 60 * 1000,
  });

  const { data: forecasts = [] } = useQuery({
    queryKey: ['forecast', id],
    queryFn: () =>
      getStationForecast(
        id || 'stn-01',
        station?.warningLevel,
        station?.dangerLevel,
        station?.hfl
      ),
    enabled: Boolean(id || stations.length),
    refetchInterval: 3 * 60 * 1000,
  });

  if (isLoadingStations || !station) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading station telemetry...</p>
      </div>
    );
  }

  let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
  if (station.status === 'Above normal') badgeColor = 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200';
  else if (station.status === 'Severe') badgeColor = 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200';
  else if (station.status === 'Extreme') badgeColor = 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200';

  return (
    <div className="space-y-6">
      {/* Back to Stations Navigation */}
      <div>
        <NavLink
          to="/stations"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToStations}</span>
        </NavLink>
      </div>

      {/* Station Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {language === 'hi' && station.hindiName ? station.hindiName : station.name}
              </h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                {station.status}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {station.type === 'reservoir-inflow' ? 'Reservoir Inflow Station' : 'River-Level Gauging Station'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-blue-600" />
                River: <strong className="text-slate-700 dark:text-slate-200">{station.river}</strong> ({station.basin} Basin)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {station.district}, {station.state}
              </span>
              <span>•</span>
              <span>Coordinates: {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E</span>
            </div>
          </div>

          {/* Current Level Highlight */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 text-right min-w-[200px]">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">
              Current Water Level
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {station.currentLevel.toFixed(2)} <span className="text-sm font-bold text-slate-500">m</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs font-semibold mt-1">
              {station.trend === 'Rising' ? (
                <span className="text-red-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Rising
                </span>
              ) : station.trend === 'Falling' ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Falling
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-0.5">
                  <Minus className="w-3.5 h-3.5" />
                  Steady
                </span>
              )}
              <span className="text-slate-400 font-normal">| {formatIST(station.lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Grid: Hydraulic Staff Gauge + Hydrograph Chart ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Staff Gauge (1 Col) */}
        <div className="lg:col-span-1">
          <HydraulicStaffGauge station={station} />
        </div>

        {/* Hydrograph (2 Cols) */}
        <div className="lg:col-span-2">
          <HydrographChart
            station={station}
            observations={observations}
            forecasts={forecasts}
          />
        </div>
      </div>

      {/* ─── Forecast Table ────────────────────────────────────────────── */}
      <ForecastTable forecasts={forecasts} />

      {/* ─── Same River Connected Stations ─────────────────────────────── */}
      <SameRiverStations currentStation={station} allStations={stations} />
    </div>
  );
};
