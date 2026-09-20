import React, { useState } from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Cloud,
  CloudRain,
  CloudSun,
  CloudMoon,
  CloudSnow,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { LiveWeatherTelemetry } from '../../lib/liveDataSource';

interface WeatherViewProps {
  weather: LiveWeatherTelemetry | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WeatherView: React.FC<WeatherViewProps> = ({
  weather,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | '5days'>('today');

  const temp = weather?.temperature ?? 18;
  const condition = weather?.condition ?? 'Cloudy';
  const feelsLike = weather?.feelsLike ?? 18;
  const humidity = weather?.humidity ?? 62;
  const windSpeed = weather?.windSpeed ?? 12;
  const pressure = weather?.pressure ?? 1015;

  // Exact 5 hourly points from Screenshot 3
  const hourlyData = [
    { time: 'Now', temp: 18, rainMm: 1.0, icon: 'snow' },
    { time: '18:00', temp: 17, rainMm: 6.4, icon: 'cloud' },
    { time: '19:00', temp: 16, rainMm: 14.2, icon: 'rain' },
    { time: '20:00', temp: 15, rainMm: 7.0, icon: 'moon' },
    { time: '21:00', temp: 14, rainMm: 20.5, icon: 'rain' },
  ];

  // Daily forecast for the "Next 5 Days" view
  const next5Days = [
    { day: 'Today', tempMax: 28, tempMin: 18, condition: 'Rain', icon: 'rain' },
    { day: 'Mon', tempMax: 27, tempMin: 19, condition: 'Cloudy', icon: 'cloud' },
    { day: 'Tue', tempMax: 26, tempMin: 20, condition: 'Partly Cloudy', icon: 'sun' },
    { day: 'Wed', tempMax: 28, tempMin: 21, condition: 'Mainly Clear', icon: 'sun' },
    { day: 'Thu', tempMax: 29, tempMin: 21, condition: 'Partly Cloudy', icon: 'sun' },
  ];

  const renderWeatherIcon = (type: string, size = 'w-6 h-6') => {
    switch (type) {
      case 'snow':
        return <CloudSnow className={`${size} text-blue-400`} />;
      case 'rain':
        return <CloudRain className={`${size} text-blue-400`} />;
      case 'moon':
        return <CloudMoon className={`${size} text-blue-400`} />;
      case 'sun':
        return <CloudSun className={`${size} text-amber-400`} />;
      case 'cloud':
      default:
        return <Cloud className={`${size} text-blue-300`} />;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Title & Subtitle (exact match from Screenshot 3) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1F38] dark:text-white tracking-tight">
          Weather &amp; Forecast
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time weather data and rainfall predictions for Bengaluru.
        </p>
      </div>

      {/* Main Current Weather Card (exact match from Screenshot 3) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Column: 3D Weather Icon + Temp + Condition + Feels like */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center relative">
              <img
                src="/weather_sun_cloud.jpg"
                alt="Cloudy weather"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-4xl sm:text-5xl pointer-events-none absolute inset-0 flex items-center justify-center">
                ⛅
              </span>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-[#0D1F38] dark:text-white tracking-tight">
                {temp}°C
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 mt-1">
                {condition}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Feels like {feelsLike}°
              </div>
            </div>
          </div>

          {/* Right Column: Humidity, Wind, Pressure (exact match with icons and dividers) */}
          <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-8 space-y-4">
            {/* Humidity */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-medium">
                <Droplets className="w-4 h-4 text-[#1D4ED8]" />
                <span>Humidity</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{humidity}%</div>
            </div>

            {/* Wind */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-medium">
                <Wind className="w-4 h-4 text-[#1D4ED8]" />
                <span>Wind</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{windSpeed} km/h</div>
            </div>

            {/* Pressure */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-medium">
                <Gauge className="w-4 h-4 text-[#1D4ED8]" />
                <span>Pressure</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white">{pressure} hPa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Tabs: [ Today ]  [ Next 5 Days ] (exact match from Screenshot 3) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-7 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          Today
        </button>

        <button
          onClick={() => setActiveTab('5days')}
          className={`px-7 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === '5days'
              ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          Next 5 Days
        </button>
      </div>

      {/* Hourly / 5 Days Forecast Row (exact match from Screenshot 3) */}
      {activeTab === 'today' ? (
        <div className="grid grid-cols-5 gap-2 sm:gap-3.5 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800">
          {hourlyData.map((item, idx) => (
            <div
              key={idx}
              className="text-center flex flex-col items-center justify-between py-1 gap-2"
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {item.time}
              </div>
              <div className="my-1">{renderWeatherIcon(item.icon, 'w-6 h-6')}</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {item.temp}°
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 sm:gap-3.5 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 dark:border-slate-800">
          {next5Days.map((item, idx) => (
            <div
              key={idx}
              className="text-center flex flex-col items-center justify-between py-1 gap-2"
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {item.day}
              </div>
              <div className="my-1">{renderWeatherIcon(item.icon, 'w-6 h-6')}</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {item.tempMax}° / {item.tempMin}°
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rainfall Forecast Chart Card (exact match from Screenshot 3) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
        <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-4">
          Rainfall Forecast
        </div>

        <div className="h-44 sm:h-48 w-full relative">
          <div className="absolute top-0 left-0 text-[11px] font-medium text-slate-400">
            mm
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
                opacity={0.7}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 30]}
                ticks={[0, 10, 20, 30]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {payload[0].value} mm
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="rainMm"
                fill="#93C5FD"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
