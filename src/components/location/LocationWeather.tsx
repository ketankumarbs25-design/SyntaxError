/**
 * FLOWSHIELD — LocationWeather (Enhanced with OpenWeatherMap + Air Quality)
 *
 * Uses OpenWeatherMap API for:
 * - Current weather (temp, humidity, wind, pressure, visibility, clouds)
 * - Real-time rainfall rate
 * - Weather icon from OWM
 * - Air Quality Index (AQI) with pollutant breakdown
 * - 3-hour forecast snippet
 *
 * "Simulate This Weather" button feeds real rainfall into the simulation.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { API_KEYS, API_ENDPOINTS } from '../../config/api';

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  visibility: number;
  clouds: number;
  rainfall: number; // mm in last 1h
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  lat: number;
  lon: number;
}

interface AirQualityData {
  aqi: number; // 1-5
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

interface ForecastItem {
  time: string;
  temp: number;
  rain: number;
  icon: string;
  description: string;
}

interface LocationWeatherProps {
  onApplyRainfall: (intensity: number) => void;
  externalQuery?: string | null;
}

const AQI_LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: 'Good', color: 'text-emerald-400', emoji: '🟢' },
  2: { label: 'Fair', color: 'text-yellow-400', emoji: '🟡' },
  3: { label: 'Moderate', color: 'text-orange-400', emoji: '🟠' },
  4: { label: 'Poor', color: 'text-red-400', emoji: '🔴' },
  5: { label: 'Very Poor', color: 'text-purple-400', emoji: '🟣' },
};

function getWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function getFloodRisk(rainfall: number): { text: string; color: string; bg: string; emoji: string } {
  if (rainfall >= 50) return { text: 'High Flood Risk', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', emoji: '🚨' };
  if (rainfall >= 20) return { text: 'Moderate Risk', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', emoji: '⚠️' };
  if (rainfall > 2) return { text: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', emoji: '✅' };
  return { text: 'No Risk', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', emoji: '🛡️' };
}

function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const LocationWeather: React.FC<LocationWeatherProps> = ({ onApplyRainfall, externalQuery }) => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const performSearch = useCallback(async (searchCity: string) => {
    const trimmed = searchCity.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setIsLoading(true);
    setError(null);
    setWeather(null);
    setAirQuality(null);
    setForecast([]);

    try {
      // 1. Current Weather
      const weatherRes = await fetch(
        `${API_ENDPOINTS.OWM_WEATHER}?q=${encodeURIComponent(trimmed)}&appid=${API_KEYS.OPENWEATHERMAP}&units=metric`
      );

      if (!weatherRes.ok) {
        if (weatherRes.status === 404) {
          setError(`City "${trimmed}" not found. Try another name.`);
        } else {
          setError('Weather service error. Try again.');
        }
        setIsLoading(false);
        return;
      }

      const w = await weatherRes.json();

      const rainfall = (w.rain?.['1h'] || w.rain?.['3h'] || 0);

      const weatherData: WeatherData = {
        city: w.name,
        country: w.sys?.country || '',
        temperature: w.main.temp,
        feelsLike: w.main.feels_like,
        humidity: w.main.humidity,
        pressure: w.main.pressure,
        windSpeed: w.wind.speed * 3.6, // m/s → km/h
        windDeg: w.wind.deg || 0,
        visibility: (w.visibility || 10000) / 1000, // m → km
        clouds: w.clouds?.all || 0,
        rainfall,
        description: w.weather?.[0]?.description || 'Unknown',
        icon: w.weather?.[0]?.icon || '01d',
        sunrise: w.sys?.sunrise || 0,
        sunset: w.sys?.sunset || 0,
        lat: w.coord.lat,
        lon: w.coord.lon,
      };
      setWeather(weatherData);

      // 2. Air Quality (async, non-blocking)
      fetch(
        `${API_ENDPOINTS.OWM_AIR_QUALITY}?lat=${w.coord.lat}&lon=${w.coord.lon}&appid=${API_KEYS.OPENWEATHERMAP}`
      )
        .then((r) => r.json())
        .then((aq) => {
          if (aq.list?.[0]) {
            const item = aq.list[0];
            setAirQuality({
              aqi: item.main.aqi,
              pm25: item.components.pm2_5,
              pm10: item.components.pm10,
              o3: item.components.o3,
              no2: item.components.no2,
              so2: item.components.so2,
              co: item.components.co,
            });
          }
        })
        .catch(() => {}); // Non-critical

      // 3. 3-hour Forecast (next 5 entries)
      fetch(
        `${API_ENDPOINTS.OWM_FORECAST}?lat=${w.coord.lat}&lon=${w.coord.lon}&appid=${API_KEYS.OPENWEATHERMAP}&units=metric&cnt=5`
      )
        .then((r) => r.json())
        .then((fc) => {
          if (fc.list) {
            setForecast(
              fc.list.map((item: any) => ({
                time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: item.main.temp,
                rain: item.rain?.['3h'] || 0,
                icon: item.weather?.[0]?.icon || '01d',
                description: item.weather?.[0]?.description || '',
              }))
            );
          }
        })
        .catch(() => {});
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWeather = useCallback(() => {
    performSearch(query);
  }, [performSearch, query]);

  React.useEffect(() => {
    if (externalQuery) {
      performSearch(externalQuery);
    }
  }, [externalQuery, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchWeather();
  };

  const risk = weather ? getFloodRisk(weather.rainfall) : null;
  const aqiInfo = airQuality ? AQI_LABELS[airQuality.aqi] || AQI_LABELS[1] : null;

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60 flex items-center gap-2.5">
        <span className="text-lg">📍</span>
        <h3 className="font-semibold text-sm text-white">Check Your Location</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto">Live Data</span>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a city name..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all"
          />
          <button
            onClick={fetchWeather}
            disabled={isLoading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-spin inline-block">⏳</span>
            ) : (
              'Search'
            )}
          </button>
        </div>
        {error && <p className="mt-2.5 text-sm text-red-400 px-1">{error}</p>}
      </div>

      {/* Results */}
      <AnimatePresence>
        {weather && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Location + Weather Overview */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold text-base">{weather.city}, {weather.country}</h4>
                  <p className="text-slate-400 text-xs capitalize">{weather.description}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <img
                    src={`${API_ENDPOINTS.OWM_ICON}/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="w-12 h-12 -my-1"
                  />
                  <div className="text-2xl font-bold text-white">{Math.round(weather.temperature)}°C</div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                  <div className="text-[10px] text-slate-400">🌡️ Feels Like</div>
                  <div className="text-sm font-bold text-white">{Math.round(weather.feelsLike)}°C</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                  <div className="text-[10px] text-slate-400">🌧️ Rainfall</div>
                  <div className="text-sm font-bold text-cyan-300">{weather.rainfall.toFixed(1)} mm/h</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                  <div className="text-[10px] text-slate-400">💨 Wind</div>
                  <div className="text-sm font-bold text-white">{weather.windSpeed.toFixed(0)} km/h {getWindDirection(weather.windDeg)}</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                  <div className="text-[10px] text-slate-400">💧 Humidity</div>
                  <div className="text-sm font-bold text-white">{weather.humidity}%</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                  <div className="text-[10px] text-slate-400">🌥️ Clouds</div>
                  <div className="text-sm font-bold text-white">{weather.clouds}%</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                  <div className="text-[10px] text-slate-400">👁️ Visibility</div>
                  <div className="text-sm font-bold text-white">{weather.visibility.toFixed(1)} km</div>
                </div>
              </div>

              {/* Air Quality */}
              {airQuality && aqiInfo && (
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">🌬️ Air Quality</span>
                    <span className={`text-xs font-bold ${aqiInfo.color}`}>{aqiInfo.emoji} {aqiInfo.label} (AQI {airQuality.aqi}/5)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                      <span className="text-slate-500">PM2.5</span>
                      <span className="text-slate-300 font-medium">{airQuality.pm25.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                      <span className="text-slate-500">PM10</span>
                      <span className="text-slate-300 font-medium">{airQuality.pm10.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                      <span className="text-slate-500">O₃</span>
                      <span className="text-slate-300 font-medium">{airQuality.o3.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                      <span className="text-slate-500">NO₂</span>
                      <span className="text-slate-300 font-medium">{airQuality.no2.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                      <span className="text-slate-500">SO₂</span>
                      <span className="text-slate-300 font-medium">{airQuality.so2.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 rounded bg-slate-900/50">
                      <span className="text-slate-500">CO</span>
                      <span className="text-slate-300 font-medium">{airQuality.co.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Flood Risk Assessment */}
              {risk && (
                <div className={`p-3 rounded-xl border ${risk.bg} flex items-center justify-between`}>
                  <div>
                    <div className="text-xs text-slate-400">Flood Risk Assessment</div>
                    <div className={`text-sm font-bold mt-0.5 ${risk.color}`}>{risk.text}</div>
                  </div>
                  <span className="text-2xl">{risk.emoji}</span>
                </div>
              )}

              {/* Expandable Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-300 py-1 transition-colors"
              >
                {showDetails ? '▲ Less Details' : '▼ More Details (Forecast, Sun Times)'}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {/* Sun Times */}
                    <div className="flex gap-2">
                      <div className="flex-1 p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                        <div className="text-[10px] text-slate-400">🌅 Sunrise</div>
                        <div className="text-xs font-bold text-amber-300">{formatTime(weather.sunrise)}</div>
                      </div>
                      <div className="flex-1 p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                        <div className="text-[10px] text-slate-400">🌇 Sunset</div>
                        <div className="text-xs font-bold text-orange-300">{formatTime(weather.sunset)}</div>
                      </div>
                      <div className="flex-1 p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                        <div className="text-[10px] text-slate-400">🔵 Pressure</div>
                        <div className="text-xs font-bold text-white">{weather.pressure} hPa</div>
                      </div>
                    </div>

                    {/* Forecast */}
                    {forecast.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-400 mb-1.5 font-medium">📅 Upcoming Forecast</div>
                        <div className="flex gap-1.5 overflow-x-auto">
                          {forecast.map((fc, i) => (
                            <div key={i} className="flex-shrink-0 p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center min-w-[70px]">
                              <div className="text-[10px] text-slate-400">{fc.time}</div>
                              <img src={`${API_ENDPOINTS.OWM_ICON}/${fc.icon}.png`} alt="" className="w-8 h-8 mx-auto" />
                              <div className="text-xs font-bold text-white">{Math.round(fc.temp)}°</div>
                              {fc.rain > 0 && (
                                <div className="text-[9px] text-cyan-400">{fc.rain.toFixed(1)}mm</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Simulate Button */}
              <button
                onClick={() => onApplyRainfall(Math.max(5, Math.round(weather.rainfall)))}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500/80 hover:to-blue-500/80 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                <span>Simulate This Weather ({Math.max(5, Math.round(weather.rainfall))} mm/hr)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
