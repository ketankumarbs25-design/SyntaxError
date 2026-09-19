/**
 * FLOWSHIELD — RealMap / LiveMap (Live Data Mode Only)
 *
 * Strictly Real-World Data:
 * 1. Real OpenStreetMap geographical map.
 * 2. Search location marker.
 * 3. Real weather data from Open-Meteo API.
 * 4. Weather-based flood risk model estimate.
 * 5. Real flood data if available (via GeoJSON).
 * 6. Official data source attributions and live timestamp.
 *
 * STRICT RULE:
 * - NO 8x8 grid.
 * - NO rectangular flood blocks.
 * - NO artificial flood polygons.
 * - NO fake water depths or fabricated population counts.
 * - If no real spatial flood dataset is provided, NO flood polygon is drawn.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './liveFloodMap.css';
import {
  Search,
  RotateCcw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Globe,
  Info,
  X,
  Radio,
  Clock,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  Loader2,
} from 'lucide-react';
import { geocodeLocation, type GeocodedLocation, DEFAULT_LOCATION } from './geocoding';

export interface WeatherData {
  temperature: number;
  rainfall_mm: number;
  humidity: number;
  windspeed: number;
  weathercode: number;
  forecast_rainfall_24h: number | null;
  timestamp: string;
}

export interface LiveMapProps {
  location?: GeocodedLocation;
  onLocationChange: (loc: GeocodedLocation) => void;
  onWeatherChange?: (weather: WeatherData) => void;
  realFloodGeoJson?: GeoJSON.GeoJsonObject | null;
}

const POPULAR_PRESETS: { label: string; query: string }[] = [
  { label: 'Koramangala', query: 'Koramangala, Bengaluru' },
  { label: 'Whitefield', query: 'Whitefield, Bengaluru' },
  { label: 'Mysore', query: 'Mysore' },
  { label: 'Chennai', query: 'Chennai' },
  { label: 'Patna', query: 'Patna' },
  { label: 'Nuwakot', query: 'Nuwakot, Nepal' },
];

function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 9) return 'Foggy';
  if (code <= 19) return 'Light drizzle';
  if (code <= 29) return 'Rain';
  if (code <= 39) return 'Snowfall';
  if (code <= 49) return 'Dense fog';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 84) return 'Rain showers';
  if (code <= 94) return 'Thunderstorm';
  return 'Severe storm';
}

function deriveWeatherRiskEstimate(w: WeatherData): {
  label: string;
  color: string;
  bg: string;
  note: string;
} {
  const rain = w.rainfall_mm;
  const forecast = w.forecast_rainfall_24h ?? 0;
  const combined = rain + forecast * 0.1;

  if (combined > 50) {
    return {
      label: 'HIGH',
      color: 'text-red-400',
      bg: 'bg-red-500/20 border-red-500/50',
      note: 'Heavy rainfall detected. Potential for localized surface water accumulation.',
    };
  }
  if (combined > 20) {
    return {
      label: 'ELEVATED',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20 border-orange-500/50',
      note: 'Moderate rainfall detected. Monitor local drainage channels.',
    };
  }
  if (combined > 5) {
    return {
      label: 'LOW',
      color: 'text-amber-400',
      bg: 'bg-amber-500/20 border-amber-500/50',
      note: 'Light precipitation. Low likelihood of surface water ponding.',
    };
  }
  return {
    label: 'MINIMAL',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20 border-emerald-500/50',
    note: 'Little or no rainfall recorded. Dry ambient ground conditions.',
  };
}

async function fetchOpenMeteoWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + lat.toFixed(4) +
    '&longitude=' + lon.toFixed(4) +
    '&current=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m,weathercode' +
    '&hourly=precipitation&forecast_days=1&timezone=auto';

  const res = await fetch(url);
  if (!res.ok) throw new Error('Open-Meteo returned HTTP ' + res.status);
  const json = await res.json();
  const current = json.current ?? {};
  const hourly = json.hourly ?? {};
  const forecast24h: number | null = Array.isArray(hourly.precipitation)
    ? (hourly.precipitation as number[]).slice(0, 24).reduce((a: number, b: number) => a + b, 0)
    : null;

  return {
    temperature: current.temperature_2m ?? 0,
    rainfall_mm: current.precipitation ?? 0,
    humidity: current.relative_humidity_2m ?? 0,
    windspeed: current.windspeed_10m ?? 0,
    weathercode: current.weathercode ?? 0,
    forecast_rainfall_24h: forecast24h,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export const LiveMap: React.FC<LiveMapProps> = ({
  location = DEFAULT_LOCATION,
  onLocationChange,
  onWeatherChange,
  realFloodGeoJson,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);

  // Weather telemetry state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const weatherRisk = useMemo(() => (weather ? deriveWeatherRiskEstimate(weather) : null), [weather]);

  // ─── Initialize Leaflet Geographical Map ──────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [location.lat, location.lon],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      minZoom: 3,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Search location marker
    const markerIcon = L.divIcon({
      className: 'location-marker-pin',
      html: '<div class="location-marker-pulse"></div><div class="location-marker-core"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker([location.lat, location.lon], {
      icon: markerIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindPopup(
      '<div style="font-size:12px;line-height:1.4">' +
        '<strong style="color:#22d3ee">' +
        location.name +
        '</strong><br/>' +
        '<span style="color:#94a3b8">' +
        location.lat.toFixed(4) +
        ', ' +
        location.lon.toFixed(4) +
        '</span>' +
        '</div>'
    );

    markerRef.current = marker;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        map.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ─── Sync when location prop changes ───────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo([location.lat, location.lon], 13, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      markerRef.current.setPopupContent(
        '<div style="font-size:12px;line-height:1.4">' +
          '<strong style="color:#22d3ee">' +
          location.name +
          '</strong><br/>' +
          '<span style="color:#94a3b8">' +
          location.lat.toFixed(4) +
          ', ' +
          location.lon.toFixed(4) +
          '</span>' +
          '</div>'
      );
      markerRef.current.openPopup();
    }
  }, [location]);

  // ─── Handle Real GeoJSON Overlay (Only if actual data exists) ──────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
      geoJsonLayerRef.current = null;
    }

    if (realFloodGeoJson) {
      const geoLayer = L.geoJSON(realFloodGeoJson, {
        style: {
          color: '#06b6d4',
          weight: 2,
          fillColor: '#0891b2',
          fillOpacity: 0.35,
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            layer.bindPopup(
              '<div style="font-size:11px">' +
                '<strong>Verified Flood Boundary</strong><br/>' +
                JSON.stringify(feature.properties) +
                '</div>'
            );
          }
        },
      }).addTo(mapInstanceRef.current);

      geoJsonLayerRef.current = geoLayer;
    }
  }, [realFloodGeoJson]);

  // ─── Fetch Weather Telemetry ──────────────────────────────────────────────
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const data = await fetchOpenMeteoWeather(lat, lon);
      setWeather(data);
      onWeatherChange?.(data);
    } catch {
      setWeatherError('Telemetry unavailable for this coordinate. Check network connection.');
    } finally {
      setWeatherLoading(false);
    }
  }, [onWeatherChange]);

  // Fetch weather when location changes
  useEffect(() => {
    fetchWeather(location.lat, location.lon);
  }, [location.lat, location.lon, fetchWeather]);

  // ─── Search Handlers ──────────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (queryToSearch?: string) => {
      const q = (queryToSearch || searchInput).trim();
      if (!q) return;

      setIsSearching(true);
      setSearchError(null);

      try {
        const result = await geocodeLocation(q);
        onLocationChange(result);
        setSearchInput(result.name);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to find location. Please try another name.';
        setSearchError(msg);
      } finally {
        setIsSearching(false);
      }
    },
    [searchInput, onLocationChange]
  );

  const handleResetMap = useCallback(() => {
    onLocationChange(DEFAULT_LOCATION);
    setSearchInput('');
    setSearchError(null);
  }, [onLocationChange]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 200);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  return (
    <div className="space-y-3">
      {/* Live Data Mode Banner */}
      <div className="flex items-start justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/8 border border-cyan-500/20 text-xs text-cyan-400">
        <div className="flex items-start gap-2">
          <Globe className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <strong>LIVE DATA MODE</strong> - Real geographic map showing actual roads, topography, and live Open-Meteo weather telemetry.
            <div className="text-[11px] text-slate-400 mt-0.5">
              Normal OpenStreetMap view for <strong>{location.name}</strong>. Artificial simulation grid is strictly disabled.
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDataSources((v) => !v)}
          className="shrink-0 flex items-center gap-1 text-[11px] underline underline-offset-2 hover:text-cyan-200 transition-colors cursor-pointer"
        >
          <Info className="w-3 h-3" />
          <span>{showDataSources ? 'Hide Sources' : 'Data Sources'}</span>
        </button>
      </div>

      {/* Data Sources Transparency Drawer */}
      {showDataSources && (
        <div className="px-3.5 py-3 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Telemetry & Service Attributions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-0.5">Map Cartography</div>
              <div className="text-slate-300">OpenStreetMap</div>
              <div className="text-slate-500 text-[10px]">&copy; OSM Contributors (ODbL)</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-0.5">Geocoding Search</div>
              <div className="text-slate-300">Nominatim</div>
              <div className="text-slate-500 text-[10px]">OpenStreetMap Foundation</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-0.5">Weather Telemetry</div>
              <div className="text-slate-300">Open-Meteo</div>
              <div className="text-slate-500 text-[10px]">Live meteorological API</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>No municipal river gauge sensors are connected. Risk estimate reflects weather hazard potential only.</span>
          </div>
        </div>
      )}

      {/* Location Search Bar */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-3 shadow-xl backdrop-blur-sm space-y-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter area or location... (e.g. Koramangala, Bengaluru)"
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleResetMap}
            title="Reset to default location"
            className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-all shadow-sm cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Quick Locations:</span>
          {POPULAR_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setSearchInput(p.query);
                handleSearch(p.query);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800/60 hover:bg-cyan-500/15 border border-slate-700/40 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {searchError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Map Display Wrapper */}
      <div ref={mapWrapperRef} className={'flood-map-wrapper ' + (isFullscreen ? 'is-fullscreen' : '')}>
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-[1001] px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Exit Fullscreen (Esc)</span>
          </button>
        )}

        <div ref={mapContainerRef} className="flood-map-container" />

        {/* Real Data HUD Overlay */}
        <div className="absolute top-3 left-3 z-[1000] w-64 max-w-[calc(100%-24px)] bg-slate-950/92 backdrop-blur-md border border-slate-700/70 rounded-xl p-3 shadow-2xl pointer-events-auto">
          <div className="pb-2 border-b border-slate-800/80 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Searched Location</span>
              {weather && (
                <span className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  {weather.timestamp}
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-white truncate mt-0.5" title={location.name}>
              {location.name}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {weatherLoading && (
              <div className="flex items-center gap-2 text-slate-400 py-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Fetching live weather telemetry...</span>
              </div>
            )}

            {weatherError && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{weatherError}</span>
              </div>
            )}

            {weather && !weatherLoading && (
              <>
                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-cyan-400" />
                    <span>Atmospheric:</span>
                  </span>
                  <span className="text-slate-200 text-[11px] font-medium">{describeWeatherCode(weather.weathercode)}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>Precipitation (now):</span>
                  </span>
                  <span className="font-bold text-cyan-300">{weather.rainfall_mm.toFixed(1)} mm/h</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    <span>Temperature:</span>
                  </span>
                  <span className="font-bold text-amber-300">{weather.temperature.toFixed(1)} °C</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400">Relative Humidity:</span>
                  <span className="font-bold text-sky-300">{weather.humidity}%</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-slate-400" />
                    <span>Wind Velocity:</span>
                  </span>
                  <span className="font-bold text-slate-200">{weather.windspeed.toFixed(0)} km/h</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-400">24h Forecast Rain:</span>
                  <span className="font-bold text-indigo-300">
                    {weather.forecast_rainfall_24h !== null
                      ? weather.forecast_rainfall_24h.toFixed(1) + ' mm'
                      : 'Data unavailable'}
                  </span>
                </div>

                {/* Weather-Based Flood Risk Estimate */}
                {weatherRisk && (
                  <div className={'px-2.5 py-2 rounded-lg border ' + weatherRisk.bg + ' mt-1 space-y-1'}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Weather-Based Flood Risk</span>
                      <span className={'text-[11px] font-extrabold ' + weatherRisk.color}>{weatherRisk.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">{weatherRisk.note}</p>
                    <div className="text-[9px] text-slate-400 pt-0.5 border-t border-slate-700/50">
                      * This is a model estimate based on available weather data. It is NOT an observed flood condition.
                    </div>
                  </div>
                )}

                {/* Honest Unmeasured Data Notifications */}
                <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Level:</span>
                    <span className="text-slate-500 italic">No real-time sensor data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">People at Risk:</span>
                    <span className="text-slate-500 italic">No verified data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flood Boundary:</span>
                    <span className="text-slate-500 italic">
                      {realFloodGeoJson ? 'Verified GeoJSON Layer' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {!weather && !weatherLoading && !weatherError && (
              <div className="text-[11px] text-slate-500 py-1">Search a location to fetch weather telemetry.</div>
            )}
          </div>
        </div>

        {/* Live Attribution Footer */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-1.5 shadow-2xl text-[10px] text-slate-400 pointer-events-auto flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>
            Weather: <span className="text-cyan-400">Open-Meteo</span> · Cartography:{' '}
            <span className="text-cyan-400">OpenStreetMap</span>
          </span>
        </div>
      </div>
    </div>
  );
};
