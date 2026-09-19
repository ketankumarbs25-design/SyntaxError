/**
 * FLOWSHIELD — SimulationMap (Simulation Mode Only)
 *
 * Dedicated to the 8x8 FlowShield hydrodynamic simulation model:
 * - 64 Zones: A1..H8
 * - Anchored dynamically to the user's selected location (coordinates).
 * - Driven by Storm Settings and computeGridRiskAssessments (riskEngine.ts).
 * - Parameters: Rainfall Intensity, Storm Duration, Drainage Efficiency,
 *   Terrain Elevation Multiplier & Neighboring Spillover Diffusion.
 * - Clearly labeled: "SIMULATED FLOOD MODEL"
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './liveFloodMap.css';
import {
  FlaskConical,
  Zap,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Loader2,
  Search,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import type { CellState, SimConfig, SimStats } from '../../sim/types';
import { computeGridRiskAssessments, type ZoneRiskAssessment } from './riskEngine';
import { geocodeLocation, type GeocodedLocation, DEFAULT_LOCATION } from './geocoding';
import type { WeatherData } from './LiveMap';

export interface SimulationMapProps {
  cells: CellState[];
  config: SimConfig;
  stats: SimStats;
  location?: GeocodedLocation;
  liveWeather?: WeatherData | null;
  onLocationChange?: (loc: GeocodedLocation) => void;
  selectedCellId?: string | null;
  focusedZoneId?: string | null;
  onSelectCell?: (cellId: string) => void;
  onClearFocusedZone?: () => void;
  onRunSimulation?: () => void;
}

const GRID_CELL_SIZE = 0.0038;

const POPULAR_PRESETS: { label: string; query: string }[] = [
  { label: 'Koramangala', query: 'Koramangala, Bengaluru' },
  { label: 'Whitefield', query: 'Whitefield, Bengaluru' },
  { label: 'Mysore', query: 'Mysore' },
  { label: 'Chennai', query: 'Chennai' },
  { label: 'Patna', query: 'Patna' },
  { label: 'Nuwakot', query: 'Nuwakot, Nepal' },
];

export const SimulationMap: React.FC<SimulationMapProps> = ({
  cells,
  config,
  stats,
  location = DEFAULT_LOCATION,
  liveWeather,
  onLocationChange,
  selectedCellId,
  focusedZoneId,
  onSelectCell,
  onClearFocusedZone,
  onRunSimulation,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonMapRef = useRef<Map<string, L.Polygon>>(new Map());

  // ─── Hydrodynamic Risk Engine ─────────────────────────────────────────────
  const riskAssessments = useMemo(() => computeGridRiskAssessments(cells, config), [cells, config]);

  const highestRiskZone = useMemo<ZoneRiskAssessment | null>(() => {
    let highest: ZoneRiskAssessment | null = null;
    riskAssessments.forEach((a) => {
      if (!highest || a.score > highest.score) highest = a;
    });
    return highest;
  }, [riskAssessments]);

  const overallSimRisk = useMemo(() => {
    const s = highestRiskZone ? highestRiskZone.score : 0;
    if (s >= 76) return { label: 'FLOODING', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/50' };
    if (s >= 51) return { label: 'WARNING', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/50' };
    if (s >= 26) return { label: 'AT RISK', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/50' };
    return { label: 'SAFE', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/50' };
  }, [highestRiskZone]);

  // ─── Initialize Leaflet Map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [location.lat, location.lon],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    polygonsLayerRef.current = layerGroup;

    // Anchor marker for the simulation grid center
    const markerIcon = L.divIcon({
      className: 'location-marker-pin',
      html: '<div class="location-marker-pulse" style="border-color:#a855f7"></div><div class="location-marker-core" style="background:#c084fc"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker([location.lat, location.lon], {
      icon: markerIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindPopup(
      '<div style="font-size:12px;line-height:1.4">' +
        '<strong style="color:#c084fc">' +
        location.name +
        '</strong><br/>' +
        '<span style="color:#94a3b8">Simulation Model Anchor</span><br/>' +
        '<span style="color:#64748b;font-size:10px">' +
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

  // ─── Sync when location changes ───────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo([location.lat, location.lon], 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      markerRef.current.setPopupContent(
        '<div style="font-size:12px;line-height:1.4">' +
          '<strong style="color:#c084fc">' +
          location.name +
          '</strong><br/>' +
          '<span style="color:#94a3b8">Simulation Model Anchor</span><br/>' +
          '<span style="color:#64748b;font-size:10px">' +
          location.lat.toFixed(4) +
          ', ' +
          location.lon.toFixed(4) +
          '</span>' +
          '</div>'
      );
      markerRef.current.openPopup();
    }
  }, [location]);

  // ─── Render 8x8 Hydrodynamic Simulation Grid at Location Coordinates ──────
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsLayerRef.current) return;

    const layerGroup = polygonsLayerRef.current;
    layerGroup.clearLayers();
    polygonMapRef.current.clear();

    const centerLat = location.lat;
    const centerLon = location.lon;
    const numRows = config.rows;
    const numCols = config.cols;

    cells.forEach((cell) => {
      const assessment = riskAssessments.get(cell.id);
      if (!assessment) return;

      const {
        row,
        col,
        zoneName,
        score,
        levelLabel,
        badgeClass,
        fillColor,
        fillOpacity,
        strokeColor,
        strokeWeight,
      } = assessment;

      const isSelected = selectedCellId === cell.id;
      const isFocused = focusedZoneId === cell.id;

      const latTop = centerLat + (numRows / 2 - row) * GRID_CELL_SIZE;
      const latBottom = centerLat + (numRows / 2 - row - 1) * GRID_CELL_SIZE;
      const lonLeft = centerLon + (col - numCols / 2) * GRID_CELL_SIZE;
      const lonRight = centerLon + (col - numCols / 2 + 1) * GRID_CELL_SIZE;

      const bounds: L.LatLngBoundsExpression = [
        [latBottom, lonLeft],
        [latTop, lonRight],
      ];

      const finalWeight = isFocused || isSelected ? 3.5 : strokeWeight;
      const finalStroke = isFocused ? '#00e5ff' : isSelected ? '#38bdf8' : strokeColor;
      const finalOpacity = isFocused || isSelected ? Math.min(0.65, fillOpacity + 0.15) : fillOpacity;

      const polygon = L.rectangle(bounds, {
        color: finalStroke,
        weight: finalWeight,
        fillColor,
        fillOpacity: finalOpacity,
        className: isFocused ? 'highlight-zone-pulse' : '',
      });

      polygon.bindTooltip(
        '<div style="font-size:11px;line-height:1.45;padding:3px">' +
          '<div style="font-weight:bold;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:8px">' +
          '<span>Zone ' +
          zoneName +
          '</span><span style="font-size:10px;opacity:0.8">Score: ' +
          score +
          '/100</span>' +
          '</div>' +
          '<div class="' +
          badgeClass +
          '" style="display:inline-block;padding:1px 6px;border-radius:4px;margin:3px 0;font-size:10px">' +
          levelLabel +
          '</div>' +
          '<div style="color:#cbd5e1">Water: <b>' +
          cell.water.toFixed(2) +
          'm</b> / Crit: ' +
          cell.criticalDepth.toFixed(2) +
          'm</div>' +
          '<div style="color:#94a3b8;font-size:10px">Pop: ' +
          cell.population.toLocaleString() +
          ' | Elev: ' +
          cell.elevation.toFixed(1) +
          'm</div>' +
          '<div style="color:#a78bfa;font-size:9px;margin-top:3px;font-weight:600">SIMULATED FLOOD MODEL · ' +
          location.name.split(',')[0] +
          '</div>' +
          '</div>',
        { sticky: true, opacity: 0.95 }
      );

      polygon.on('click', () => {
        onSelectCell?.(cell.id);
      });

      polygon.addTo(layerGroup);
      polygonMapRef.current.set(cell.id, polygon);
    });
  }, [
    cells,
    config.rows,
    config.cols,
    location,
    riskAssessments,
    selectedCellId,
    focusedZoneId,
    onSelectCell,
  ]);

  // ─── External Focus Zone Trigger ──────────────────────────────────────────
  useEffect(() => {
    if (!focusedZoneId || !mapInstanceRef.current) return;
    const polygon = polygonMapRef.current.get(focusedZoneId);
    if (polygon) {
      mapInstanceRef.current.fitBounds(polygon.getBounds(), {
        maxZoom: 16,
        padding: [60, 60],
        duration: 1.0,
      });
      polygon.openTooltip();
    }
  }, [focusedZoneId]);

  const handleResetView = useCallback(() => {
    onClearFocusedZone?.();
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([location.lat, location.lon], 14, { animate: true });
  }, [location.lat, location.lon, onClearFocusedZone]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
  }, []);

  const handleTriggerSimulation = useCallback(() => {
    setIsSimulatingRun(true);
    onRunSimulation?.();
    setTimeout(() => {
      setIsSimulatingRun(false);
    }, 1200);
  }, [onRunSimulation]);

  const handleSearch = useCallback(
    async (queryToSearch?: string) => {
      const q = (queryToSearch || searchInput).trim();
      if (!q) return;

      setIsSearching(true);
      setSearchError(null);

      try {
        const result = await geocodeLocation(q);
        onLocationChange?.(result);
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

  return (
    <div className="space-y-3">
      {/* Simulation Banner & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex-1 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300">
          <FlaskConical className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
          <div>
            <strong>SIMULATED FLOOD MODEL</strong> - Anchored to <strong>{location.name}</strong> (Zones A1 to H8).
            <div className="text-[11px] text-violet-400/80 mt-0.5">
              Hydrodynamic propagation calculated from your Storm Settings sliders (Rainfall, Duration, Drainage, Terrain).
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleResetView}
            title="Center Grid View"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 hover:text-violet-200 transition-all shadow-sm cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Location Search Bar in Simulation Mode */}
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
              placeholder="Search city for simulation... (e.g. Koramangala, Chennai, Patna)"
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Simulate City</span>
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Quick Sectors:</span>
          {POPULAR_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setSearchInput(p.query);
                handleSearch(p.query);
              }}
              className={
                'px-2 py-0.5 rounded-lg border text-xs transition-colors cursor-pointer ' +
                (location.name.toLowerCase().includes(p.label.toLowerCase())
                  ? 'bg-violet-500/25 border-violet-500/60 text-violet-200 font-semibold'
                  : 'bg-slate-800/60 hover:bg-violet-500/15 border-slate-700/40 hover:border-violet-500/40 text-slate-300 hover:text-violet-300')
              }
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

        {/* Simulation Telemetry HUD */}
        <div className="absolute top-3 left-3 z-[1000] w-64 max-w-[calc(100%-24px)] bg-slate-950/92 backdrop-blur-md border border-slate-700/70 rounded-xl p-3 shadow-2xl pointer-events-auto">
          <div className="pb-2 border-b border-slate-800/80 mb-2">
            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider block">
              Simulation Sector
            </span>
            <h4 className="text-xs font-bold text-white truncate" title={location.name}>
              {location.name}
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              {location.lat.toFixed(4)}, {location.lon.toFixed(4)} (64 Cells)
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {liveWeather && (
              <div className="flex items-center justify-between bg-violet-950/40 border border-violet-800/40 rounded-lg px-2.5 py-1.5 text-[11px]">
                <span className="text-violet-300 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-violet-400" />
                  <span>Ground Rainfall:</span>
                </span>
                <span className="font-bold text-violet-200">{liveWeather.rainfall_mm.toFixed(1)} mm/h</span>
              </div>
            )}

            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400">Sim Risk Level:</span>
              <span className={'px-2 py-0.5 rounded text-[10px] font-bold border ' + overallSimRisk.bg + ' ' + overallSimRisk.color}>
                {overallSimRisk.label}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400">Highest Risk Zone:</span>
              <span className="font-bold text-cyan-300">
                {highestRiskZone ? 'Zone ' + highestRiskZone.zoneName : 'None'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400">Peak Water Depth:</span>
              <span className="font-bold text-cyan-400">{stats.maxWater.toFixed(2)} m</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400">Storm Intensity:</span>
              <span className="font-bold text-slate-200">{config.rainfallIntensity} mm/h</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/60 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400">Drainage Capacity:</span>
              <span className="font-bold text-slate-200">{(config.drainageEfficiency * 100).toFixed(0)}%</span>
            </div>

            {/* Run Simulation Trigger */}
            <button
              onClick={handleTriggerSimulation}
              disabled={isSimulatingRun}
              className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isSimulatingRun ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>{isSimulatingRun ? 'Recalculating...' : 'Run Simulation'}</span>
            </button>

            <button
              onClick={handleResetView}
              className="w-full py-1.5 px-3 rounded-lg text-[11px] font-medium bg-slate-800/60 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Center on {location.name.split(',')[0]}</span>
            </button>
          </div>
        </div>

        {/* Simulation Risk Score Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-3 py-2 shadow-2xl text-xs pointer-events-auto">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Simulation Risk Score (0-100)
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400"></span>
              <span className="text-slate-200">Safe (0-25)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 border border-amber-400"></span>
              <span className="text-slate-200">At Risk (26-50)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/80 border border-orange-400"></span>
              <span className="text-slate-200">Warning (51-75)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/80 border border-red-400"></span>
              <span className="text-slate-200">Flooding (76-100)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
