import React, { useState } from 'react';
import {
  Download,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  generateLiveReportCsv,
  downloadReportFile,
  type SectorLiveMetrics,
  type LiveWeatherTelemetry,
} from '../../lib/liveDataSource';

interface ReportsViewProps {
  sectors: SectorLiveMetrics[];
  weather: LiveWeatherTelemetry | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ sectors, weather }) => {
  const [reportTab, setReportTab] = useState<'water' | 'rainfall' | 'sectors'>('water');
  const [timeRange, setTimeRange] = useState<'7days' | '24hours' | '30days'>('7days');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 7-day trend data matching Screenshot 4 (13 Nov to 19 Nov, 0.0 to 1.5 m)
  const waterTrendData = [
    { date: '13 Nov', value: 0.38 },
    { date: '14 Nov', value: 0.88 },
    { date: '15 Nov', value: 0.52 },
    { date: '16 Nov', value: 0.44 },
    { date: '17 Nov', value: 0.48 },
    { date: '18 Nov', value: 0.61 },
    { date: '19 Nov', value: 0.51 },
  ];

  const rainfallTrendData = [
    { date: '13 Nov', value: 8.2 },
    { date: '14 Nov', value: 34.5 },
    { date: '15 Nov', value: 12.0 },
    { date: '16 Nov', value: 4.5 },
    { date: '17 Nov', value: 6.2 },
    { date: '18 Nov', value: 19.8 },
    { date: '19 Nov', value: 14.1 },
  ];

  const handleDownloadCsv = () => {
    const csvData = generateLiveReportCsv(sectors, weather);
    downloadReportFile(csvData, `FlowShield_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reports & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          View historical data and analytics.
        </p>
      </div>

      {/* Sub-tabs: [ Water Levels ] [ Rainfall ] [ Sector Status ] */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
        <button
          onClick={() => setReportTab('water')}
          className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            reportTab === 'water'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Water Levels
        </button>
        <button
          onClick={() => setReportTab('rainfall')}
          className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            reportTab === 'rainfall'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Rainfall
        </button>
        <button
          onClick={() => setReportTab('sectors')}
          className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            reportTab === 'sectors'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sector Status
        </button>
      </div>

      {/* Timeframe Dropdown (matches Screenshot 4: "Last 7 Days v") */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowRangeDropdown(!showRangeDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-50 cursor-pointer"
        >
          <span>{timeRange === '7days' ? 'Last 7 Days' : timeRange === '24hours' ? 'Last 24 Hours' : 'Last 30 Days'}</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>

        {showRangeDropdown && (
          <div className="absolute left-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 text-xs font-medium">
            <button
              onClick={() => {
                setTimeRange('7days');
                setShowRangeDropdown(false);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                setTimeRange('24hours');
                setShowRangeDropdown(false);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => {
                setTimeRange('30days');
                setShowRangeDropdown(false);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Last 30 Days
            </button>
          </div>
        )}
      </div>

      {/* Main Trend Chart Card (matches Screenshot 4) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 dark:border-slate-800">
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-6">
          {reportTab === 'water'
            ? 'Water Level Trends'
            : reportTab === 'rainfall'
            ? 'Precipitation Trends (mm)'
            : 'Sector Drainage Inundation Index'}
        </div>

        <div className="h-60 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={reportTab === 'rainfall' ? rainfallTrendData : waterTrendData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={reportTab === 'rainfall' ? [0, 40] : [0.0, 1.5]}
                ticks={reportTab === 'rainfall' ? [0, 10, 20, 30, 40] : [0.0, 0.5, 1.0, 1.5]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {reportTab === 'rainfall'
                          ? `${payload[0].value} mm`
                          : `Water Level: ${payload[0].value} m`}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#reportAreaGrad)"
                dot={{ r: 3.5, fill: '#3B82F6', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Download Card (matches Screenshot 4: Download CSV) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Download Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Get detailed data in CSV format.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
