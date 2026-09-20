/**
 * FLOWSHIELD — Live Flood Risk Map
 *
 * Combines real-time OpenStreetMap geographic cartography with authentic
 * meteorological telemetry and scientific flood risk estimation:
 * - Real OpenStreetMap tiles with pan & zoom controls.
 * - Real-world global geocoding for any neighbourhood, city, or coordinate.
 * - Live atmospheric telemetry (precipitation rate, 24h rainfall forecast,
 *   temperature, humidity, wind, and elevation) fetched from Open-Meteo.
 * - Dynamic catchment flood risk radius halo and risk-coded map pin.
 * - Interactive on-map Telemetry & Risk Assessment HUD with verified data sources.
 * - ZERO artificial simulation grids, ZERO fake water depths.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './liveFloodMap.css';
import {
  MapPin,
  Search,
  RotateCcw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Globe,
  X,
  Loader2,
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import type { CellState, SimConfig, SimStats } from '../../sim/types';
import { geocodeLocation, type GeocodedLocation, DEFAULT_LOCATION } from './geocoding';
import {
  fetchAreaWeatherTelemetry,
  type AreaTelemetry,
  type RiskAssessment,
} from './weatherTelemetry';

export interface LiveFloodMapProps {
  cells?: CellState[];
  config?: SimConfig;
  stats?: SimStats;
  selectedCellId?: string | null;
  focusedZoneId?: string | null;
  onSelectCell?: (cellId: string) => void;
  onClearFocusedZone?: () => void;
  onRunSimulation?: () => void;
  realFloodGeoJson?: GeoJSON.GeoJsonObject | null;
  externalLocation?: string | null;
  onLocationChange?: (locationName: string, lat: number, lon: number, rainfall?: number) => void;
  cleanMapOnly?: boolean;
  onTelemetryUpdate?: (telemetry: AreaTelemetry, risk: RiskAssessment, loc: GeocodedLocation) => void;
}

const POPULAR_PRESETS: { label: string; query: string }[] = [
  { label: 'Koramangala', query: 'Koramangala, Bengaluru' },
  { label: 'Whitefield', query: 'Whitefield, Bengaluru' },
  { label: 'Indiranagar', query: 'Indiranagar, Bengaluru' },
  { label: 'Chennai', query: 'Chennai' },
  { label: 'Mumbai', query: 'Mumbai' },
  { label: 'Patna', query: 'Patna' },
  { label: 'Nuwakot', query: 'Nuwakot, Nepal' },
];

export const LiveFloodMap: React.FC<LiveFloodMapProps> = ({
  externalLocation,
  onLocationChange,
  cleanMapOnly,
  onTelemetryUpdate,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [currentLocation, setCurrentLocation] = useState<GeocodedLocation>(DEFAULT_LOCATION);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live telemetry & flood risk state
  const [telemetry, setTelemetry] = useState<AreaTelemetry | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const riskCircleRef = useRef<L.Circle | null>(null);

  const onLocationChangeRef = useRef(onLocationChange);
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  });

  const onTelemetryUpdateRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    onTelemetryUpdateRef.current = onTelemetryUpdate;
  });

  const lastFetchedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // ─── Fetch Real Weather & Risk for Current Location ───────────────────────
  const loadWeatherForLocation = useCallback(async (lat: number, lon: number) => {
    if (
      lastFetchedCoordsRef.current &&
      Math.abs(lastFetchedCoordsRef.current.lat - lat) < 0.0001 &&
      Math.abs(lastFetchedCoordsRef.current.lon - lon) < 0.0001
    ) {
      return;
    }
    lastFetchedCoordsRef.current = { lat, lon };

    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const data = await fetchAreaWeatherTelemetry(lat, lon);
      setTelemetry(data.telemetry);
      setRisk(data.risk);
      onTelemetryUpdateRef.current?.(data.telemetry, data.risk, {
        name: currentLocation.name,
        displayName: currentLocation.displayName,
        lat,
        lon,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve real-time weather telemetry.';
      setWeatherError(msg);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [currentLocation.displayName, currentLocation.name]);

  // Fetch telemetry whenever location coordinates change
  useEffect(() => {
    loadWeatherForLocation(currentLocation.lat, currentLocation.lon);
  }, [currentLocation.lat, currentLocation.lon, loadWeatherForLocation]);

  // ─── Initialize Leaflet Map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      minZoom: 3,
      maxZoom: 19,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

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

  // ─── Update Map Markers and Catchment Risk Halo ───────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const riskLevelClass = risk ? `is-${risk.level.toLowerCase()}` : 'is-low';
    const riskColor = risk ? risk.color : '#00e5ff';
    const riskLabel = risk ? risk.label : 'Evaluating';
    const riskStatus = risk ? risk.statusText : 'NORMAL';

    const rainText = telemetry ? `${telemetry.precipitation.toFixed(1)} mm/h` : 'N/A';
    const forecastText = telemetry ? `${telemetry.forecastRain24h.toFixed(1)} mm` : 'N/A';
    const tempText = telemetry ? `${telemetry.temperature.toFixed(1)}°C` : 'N/A';
    const weatherCondition = telemetry ? telemetry.weatherDesc : 'Normal';

    const markerIcon = L.divIcon({
      className: `location-marker-pin ${riskLevelClass}`,
      html: `<div class="location-marker-pulse"></div><div class="location-marker-core"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const markerPopupContent =
      `<div style="font-size:12px;line-height:1.5;min-width:180px">` +
      `<div style="font-weight:700;color:#f8fafc;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:4px;margin-bottom:6px">` +
      `${currentLocation.name}` +
      `</div>` +
      `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">` +
      `<span style="color:#94a3b8">Risk Level:</span>` +
      `<strong style="color:${riskColor};padding:1px 6px;border-radius:4px;background:${riskColor}22;border:1px solid ${riskColor}55">${riskLabel} (${riskStatus})</strong>` +
      `</div>` +
      `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">` +
      `<span style="color:#94a3b8">Condition:</span>` +
      `<span style="color:#e2e8f0">${weatherCondition} (${tempText})</span>` +
      `</div>` +
      `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">` +
      `<span style="color:#94a3b8">Live Rain:</span>` +
      `<span style="color:#38bdf8;font-weight:600">${rainText}</span>` +
      `</div>` +
      `<div style="display:flex;align-items:center;justify-content:space-between">` +
      `<span style="color:#94a3b8">24h Forecast:</span>` +
      `<span style="color:#e2e8f0">${forecastText}</span>` +
      `</div>` +
      `</div>`;

    if (!markerRef.current) {
      markerRef.current = L.marker([currentLocation.lat, currentLocation.lon], {
        icon: markerIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng([currentLocation.lat, currentLocation.lon]);
      markerRef.current.setIcon(markerIcon);
    }
    markerRef.current.bindPopup(markerPopupContent);

    const circlePopupContent =
      `<div style="font-size:12px;line-height:1.4">` +
      `<strong style="color:${riskColor}">${currentLocation.name} Catchment Zone</strong><br/>` +
      `<span style="color:#94a3b8">Calculated Risk:</span> <strong style="color:${riskColor}">${riskLabel}</strong><br/>` +
      `<span style="color:#94a3b8">Precipitation:</span> <span style="color:#38bdf8">${rainText}</span><br/>` +
      `<span style="color:#94a3b8">24h Accumulation:</span> <span style="color:#e2e8f0">${forecastText}</span>` +
      `</div>`;

    if (!riskCircleRef.current) {
      riskCircleRef.current = L.circle([currentLocation.lat, currentLocation.lon], {
        radius: 2200,
        color: riskColor,
        fillColor: riskColor,
        fillOpacity: 0.16,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
    } else {
      riskCircleRef.current.setLatLng([currentLocation.lat, currentLocation.lon]);
      riskCircleRef.current.setStyle({
        color: riskColor,
        fillColor: riskColor,
        fillOpacity: 0.16,
      });
    }
    riskCircleRef.current.bindPopup(circlePopupContent);
  }, [currentLocation.lat, currentLocation.lon, currentLocation.name, risk, telemetry]);

  // ─── Update Coordinates & FlyTo ───────────────────────────────────────────
  const updateMapLocation = useCallback((location: GeocodedLocation, zoom = 13) => {
    setCurrentLocation(location);

    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([location.lat, location.lon], zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, []);

  const lastSyncedExternalRef = useRef<string>('');

  // ─── Search Handlers ──────────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (queryToSearch?: string) => {
      const q = (queryToSearch || searchInput).trim();
      if (!q) return;

      lastSyncedExternalRef.current = q;
      setIsSearching(true);
      setSearchError(null);

      try {
        const result = await geocodeLocation(q);
        updateMapLocation(result, 13);
        setSearchInput(result.name);
        onLocationChangeRef.current?.(result.name, result.lat, result.lon);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to find location. Please try another name.';
        setSearchError(msg);
      } finally {
        setIsSearching(false);
      }
    },
    [searchInput, updateMapLocation]
  );

  // Sync when externalLocation prop changes
  useEffect(() => {
    if (
      externalLocation &&
      externalLocation.trim() &&
      externalLocation.toLowerCase() !== currentLocation.name.toLowerCase() &&
      externalLocation.toLowerCase() !== lastSyncedExternalRef.current.toLowerCase()
    ) {
      lastSyncedExternalRef.current = externalLocation;
      setSearchInput(externalLocation);
      handleSearch(externalLocation);
    }
  }, [externalLocation, currentLocation.name, handleSearch]);

  const handleResetMap = useCallback(() => {
    updateMapLocation(DEFAULT_LOCATION, 13);
    setSearchInput('');
    setSearchError(null);
    lastSyncedExternalRef.current = DEFAULT_LOCATION.name;
    onLocationChangeRef.current?.(DEFAULT_LOCATION.name, DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
  }, [updateMapLocation]);

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

  if (cleanMapOnly) {
    return (
      <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100" style={{ minHeight: '440px', height: '440px' }}>
        <div ref={mapContainerRef} className="w-full h-full" style={{ height: '440px', minHeight: '440px' }} />
      </div>
    );
  }

  return (
    <section id="live-flood-risk-map" className="w-full max-w-[840px] mx-auto space-y-3.5">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2.5 px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-sm">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Live Geographic Flood Risk Map
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              OpenStreetMap · Real Meteorological Telemetry & Ground Risk Assessment
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => loadWeatherForLocation(currentLocation.lat, currentLocation.lon)}
            disabled={isLoadingWeather}
            title="Refresh Live Weather"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleResetMap}
            title="Reset to default location"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-all shadow-sm cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Unified Area & Meteorological Telemetry Search Bar */}
      <div className="bg-slate-900/80 border border-slate-700/70 rounded-2xl p-3.5 shadow-xl backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between text-xs px-0.5 pb-0.5">
          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Unified Area & Weather Telemetry Search
          </span>
          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            One Search for Map & Telemetry
          </span>
        </div>
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
              placeholder="Type area once for both map & weather telemetry... (e.g. Koramangala, Bengaluru)"
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-950/85 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all"
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
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search Area</span>
              </>
            )}
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
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-cyan-500/15 border border-slate-700/40 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-xs"
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

        {weatherError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{weatherError}</span>
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

        {/* ─── Selected Location Badge (Top-Left) ─────────────────────────── */}
        <div className="absolute top-3 left-3 z-[1000] bg-slate-950/92 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-2 shadow-2xl pointer-events-auto max-w-[240px] sm:max-w-[300px]">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: risk?.color || '#00e5ff' }}
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate" title={currentLocation.name}>
                {currentLocation.name}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono block">
                {currentLocation.lat.toFixed(4)}°N, {currentLocation.lon.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        {/* ─── On-Map Real Meteorological Telemetry & Risk HUD (Top-Right) ── */}
        <div className="absolute top-3 right-3 z-[1000] max-w-[280px] sm:max-w-[320px] w-full pointer-events-auto">
          <div className="bg-slate-950/92 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all">
            {/* HUD Header */}
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {risk?.level === 'LOW' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: risk?.color || '#38bdf8' }} />
                )}
                <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Ground Risk Status</span>
                    {isLoadingWeather && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Real Atmospheric Telemetry
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHudCollapsed((prev) => !prev)}
                className="w-6 h-6 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isHudCollapsed ? 'Expand Details' : 'Collapse Details'}
              >
                {isHudCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Risk Badge & Score Meter */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${
                    risk?.badgeClass || 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{ backgroundColor: risk?.color || '#00e5ff' }}
                  />
                  <span>{risk?.label || 'Calculating Risk...'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  Score: <span style={{ color: risk?.color || '#38bdf8' }}>{risk?.score ?? '--'}</span>/100
                </span>
              </div>

              {/* Visual Score Bar */}
              <div className="w-full bg-slate-800/90 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${risk?.score ?? 0}%`,
                    backgroundColor: risk?.color || '#38bdf8',
                  }}
                />
              </div>

              {/* Collapsible Detailed Metrics */}
              {!isHudCollapsed && (
                <>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {/* Live Precipitation */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <CloudRain className="w-3 h-3 text-cyan-400" />
                        <span>Live Rain Rate</span>
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {telemetry ? `${telemetry.precipitation.toFixed(1)} mm/h` : '--'}
                      </div>
                    </div>

                    {/* 24h Rainfall Forecast */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span>24h Total Rain</span>
                      </div>
                      <div className="text-xs font-bold text-white font-mono">
                        {telemetry ? `${telemetry.forecastRain24h.toFixed(1)} mm` : '--'}
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <Thermometer className="w-3 h-3 text-amber-400" />
                        <span>Temp & Condition</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {telemetry ? `${telemetry.temperature.toFixed(1)}°C · ${telemetry.weatherDesc}` : '--'}
                      </div>
                    </div>

                    {/* Wind & Humidity */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <Wind className="w-3 h-3 text-emerald-400" />
                        <span>Wind / Humidity</span>
                      </div>
                      <div className="text-xs font-bold text-white font-mono truncate">
                        {telemetry ? `${telemetry.windSpeed.toFixed(0)} km/h · ${telemetry.humidity}%` : '--'}
                      </div>
                    </div>
                  </div>

                  {/* Scientific Evaluation Explanation */}
                  {risk && (
                    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-2 text-[11px] text-slate-300 leading-relaxed">
                      <p className="text-slate-200 font-medium">{risk.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1 italic">{risk.recommendation}</p>
                    </div>
                  )}

                  {/* Official Source & Timestamp */}
                  <div className="text-[9px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-800/60">
                    <span>Source: Open-Meteo & OSM</span>
                    <span>{telemetry ? `Updated: ${telemetry.updatedAt}` : 'Connecting...'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── Risk Legend Overlay (Bottom-Right) ─────────────────────────── */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-2 shadow-2xl text-[10px] pointer-events-auto hidden sm:block">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Flood Risk Scale
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Low (&lt;2.5mm)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="text-slate-300">Moderate (2.5-10mm)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-slate-300">High (10-30mm)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-slate-300">Critical (&gt;30mm)</span>
            </div>
          </div>
        </div>

        {/* ─── Cartography Attribution (Bottom-Left) ──────────────────────── */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-1.5 shadow-2xl text-[10px] text-slate-400 pointer-events-auto flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>
            Map: <span className="text-cyan-400">OpenStreetMap</span>
          </span>
        </div>
      </div>
    </section>
  );
};
