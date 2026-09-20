import React from 'react';
import {
  Map,
  Cloud,
  BarChart3,
  Bell,
  FileText,
  ArrowRight,
} from 'lucide-react';
import type { SectorLiveMetrics, LiveWeatherTelemetry } from '../../lib/liveDataSource';
import type { NavTabId } from '../nav/Navbar';

interface HomeViewProps {
  sectors: SectorLiveMetrics[];
  weather: LiveWeatherTelemetry | null;
  onNavigateTab: (tab: NavTabId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  weather,
  onNavigateTab,
}) => {
  const temp = weather?.temperature ?? 18;
  const condition = weather?.condition ?? 'Cloudy';

  return (
    <div className="w-full flex flex-col justify-between h-full space-y-6 sm:space-y-10 py-2 sm:py-4">
      {/* Hero Section (exact match from Screenshot 1) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-2 sm:pt-4 relative">
        {/* Left Hero Column */}
        <div className="space-y-4 max-w-xl">
          <div className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Urban Flood Intelligence &amp; Citizen Safety
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-[#0D1F38] dark:text-white leading-[1.12] tracking-tight">
            Safer Cities,<br />Stronger Tomorrows
          </h1>

          <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Real-time flood monitoring, early alerts and community safety for a more resilient Bengaluru.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('map')}
              className="px-6 py-2.5 rounded-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>View Live Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('weather')}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Cloud className="w-4 h-4 text-slate-500" />
              <span>Check Weather</span>
            </button>
          </div>
        </div>

        {/* Right Hero Column: Handwritten cursive script + Floating Weather Card */}
        <div className="relative flex flex-col items-end shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
          {/* Cursive Handwriting text in top right (exact match from Screenshot 1) */}
          <div className="font-['Caveat',cursive] text-2xl sm:text-3xl text-blue-900/70 dark:text-blue-300/80 -rotate-3 select-none pointer-events-none mb-3 pr-2 leading-tight">
            Clear skies<br />
            <span className="ml-3">Safer tomorrows</span>
          </div>

          {/* Floating Weather Card */}
          <div
            onClick={() => onNavigateTab('weather')}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-white/80 dark:border-slate-700/60 flex items-center gap-5 cursor-pointer hover:shadow-2xl transition-all min-w-[250px]"
          >
            {/* 3D Weather Sun & Cloud */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative flex items-center justify-center">
              <img
                src="/weather_sun_cloud.jpg"
                alt="Weather condition"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Fallback sun/cloud illustration */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl">⛅</span>
              </div>
            </div>

            {/* Weather Text */}
            <div className="space-y-0.5">
              <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                Bengaluru
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#0D1F38] dark:text-white tracking-tight">
                {temp}°C
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                {condition}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                H: 18° &nbsp; L: 5°
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 5 Cards Row (exact match from Screenshot 1) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-3.5 pt-4">
        {/* Card 1: Live Map */}
        <div
          onClick={() => onNavigateTab('map')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[145px] group"
        >
          <div>
            <div className="text-[#1D4ED8] dark:text-blue-400 mb-2.5">
              <Map className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Map
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Explore real-time water levels and sector status
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <ArrowRight className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Weather & Forecast */}
        <div
          onClick={() => onNavigateTab('weather')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[145px] group"
        >
          <div>
            <div className="text-[#1D4ED8] dark:text-blue-400 mb-2.5">
              <Cloud className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Weather &amp; Forecast
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              View rainfall, temperature and alerts
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <ArrowRight className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Sectors */}
        <div
          onClick={() => onNavigateTab('sectors')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[145px] group"
        >
          <div>
            <div className="text-[#1D4ED8] dark:text-blue-400 mb-2.5">
              <BarChart3 className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sectors
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Check drainage capacity and risk levels
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <ArrowRight className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[145px] group"
        >
          <div>
            <div className="text-[#1D4ED8] dark:text-blue-400 mb-2.5">
              <Bell className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Alerts
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Stay informed with early warnings
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <ArrowRight className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 5: Reports */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="col-span-2 md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[145px] group"
        >
          <div>
            <div className="text-[#1D4ED8] dark:text-blue-400 mb-2.5">
              <FileText className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reports
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              View past data and insights
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <ArrowRight className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
