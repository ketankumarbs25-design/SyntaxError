import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { Station, WaterObservation, WaterForecast } from '../../api/types';
import { formatISTTime, formatIST } from '../../api/status';
import { useI18n } from '../../i18n';

interface HydrographChartProps {
  station: Station;
  observations: WaterObservation[];
  forecasts: WaterForecast[];
}

export const HydrographChart: React.FC<HydrographChartProps> = ({
  station,
  observations,
  forecasts,
}) => {
  const { t } = useI18n();

  // Combine chronological points: Observed (past) + Forecast (future)
  const chartData = [
    ...observations.map((obs) => ({
      timestamp: obs.timestamp,
      displayTime: formatISTTime(obs.timestamp),
      observedLevel: obs.waterLevel,
      forecastLevel: null as number | null,
      confidenceLower: null as number | null,
      confidenceUpper: null as number | null,
      rainfallMm: obs.rainfallMm,
      isForecast: false,
    })),
    ...forecasts.map((fc) => ({
      timestamp: fc.forecastTime,
      displayTime: formatISTTime(fc.forecastTime),
      observedLevel: null as number | null,
      forecastLevel: fc.predictedLevel,
      confidenceLower: fc.confidenceLower,
      confidenceUpper: fc.confidenceUpper,
      rainfallMm: 0,
      isForecast: true,
    })),
  ];

  // Connect observed to forecast at boundary point
  if (observations.length > 0 && forecasts.length > 0) {
    const lastObs = observations[observations.length - 1];
    // Set first forecast point to also have observed connection
    const boundaryIdx = observations.length;
    if (chartData[boundaryIdx]) {
      chartData[boundaryIdx - 1].forecastLevel = lastObs.waterLevel;
    }
  }

  const { warningLevel, dangerLevel, hfl } = station;

  // Domain computation
  const allLevels = [
    ...observations.map((o) => o.waterLevel),
    ...forecasts.map((f) => f.predictedLevel),
    warningLevel,
    dangerLevel,
    hfl,
  ].filter((v) => typeof v === 'number' && !isNaN(v) && v > 0);

  const minVal = Math.floor(Math.min(...allLevels) - 1);
  const maxVal = Math.ceil(Math.max(...allLevels) + 1.5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            {t.hydrographTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Observed (Past 48h) &amp; Hydrological Forecast (Next 24h) with Warning, Danger &amp; HFL thresholds
          </p>
        </div>

        {/* Status indicator badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            <span className="w-2 h-0.5 bg-amber-500" />
            WL: {warningLevel.toFixed(2)}m
          </span>
          <span className="flex items-center gap-1 font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
            <span className="w-2 h-0.5 bg-orange-600" />
            DL: {dangerLevel.toFixed(2)}m
          </span>
          <span className="flex items-center gap-1 font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
            <span className="w-2 h-0.5 bg-red-600" />
            HFL: {hfl.toFixed(2)}m
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="observedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />

            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              interval={Math.floor(chartData.length / 8)}
            />

            <YAxis
              domain={[minVal, maxVal]}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              unit="m"
            />

            {/* Custom Tooltip in IST */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs font-sans min-w-[170px]">
                      <div className="font-bold text-slate-800 dark:text-slate-100 pb-1 border-b border-slate-100 dark:border-slate-700">
                        {formatIST(pt.timestamp)}
                      </div>
                      <div className="mt-2 space-y-1">
                        {pt.observedLevel !== null && (
                          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold">
                            <span>Observed Level:</span>
                            <span>{pt.observedLevel.toFixed(2)} m</span>
                          </div>
                        )}
                        {pt.forecastLevel !== null && (
                          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-semibold">
                            <span>Predicted Level:</span>
                            <span>{pt.forecastLevel.toFixed(2)} m</span>
                          </div>
                        )}
                        {pt.rainfallMm > 0 && (
                          <div className="flex items-center justify-between text-cyan-600 font-medium pt-1 border-t border-slate-100 dark:border-slate-700">
                            <span>Rainfall:</span>
                            <span>{pt.rainfallMm} mm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />

            {/* Reference Threshold Lines */}
            <ReferenceLine
              y={warningLevel}
              stroke="#EAB308"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'Warning Level', fill: '#CA8A04', fontSize: 10, position: 'right' }}
            />
            <ReferenceLine
              y={dangerLevel}
              stroke="#EA580C"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ value: 'Danger Level', fill: '#EA580C', fontSize: 10, position: 'right' }}
            />
            <ReferenceLine
              y={hfl}
              stroke="#DC2626"
              strokeDasharray="5 3"
              strokeWidth={2}
              label={{ value: 'HFL (Record)', fill: '#DC2626', fontSize: 10, position: 'right' }}
            />

            {/* Observed Water Level (Past) */}
            <Area
              type="monotone"
              dataKey="observedLevel"
              name="Observed Level (m)"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#observedGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#2563EB' }}
            />

            {/* Predicted Water Level (Future Forecast - Dashed) */}
            <Line
              type="monotone"
              dataKey="forecastLevel"
              name="Predicted Forecast (m)"
              stroke="#4F46E5"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 5, fill: '#4F46E5' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
