import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import type { Station } from '../../api/types';
import { useTheme } from '../../hooks/useTheme';
import { useI18n } from '../../i18n';
import { Layers, Compass } from 'lucide-react';

interface IndiaFloodMapProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
  heightClass?: string;
}

export type MapStyleKey = 'osm' | 'voyager' | 'satellite' | 'dark';

interface MapStyleConfig {
  id: MapStyleKey;
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const MAP_STYLES: Record<MapStyleKey, MapStyleConfig> = {
  osm: {
    id: 'osm',
    label: 'Real Map (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | Survey of India Reference',
    maxZoom: 19,
  },
  voyager: {
    id: 'voyager',
    label: 'Detailed Cartography',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> | &copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    label: 'Real Satellite (Earth)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 18,
  },
  dark: {
    id: 'dark',
    label: 'Dark Tactical',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://carto.com/">CARTO</a> | &copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
};

// India Geographic Center and Bounding Box
const INDIA_CENTER: [number, number] = [22.5937, 78.9629];
const INDIA_BOUNDS: L.LatLngBoundsLiteral = [
  [6.75, 68.1], // South-West (Indira Point / Rann of Kutch)
  [37.1, 97.4], // North-East (Indira Col, Ladakh / Kibithu, Arunachal Pradesh)
];

export const IndiaFloodMap: React.FC<IndiaFloodMapProps> = ({
  stations,
  onSelectStation,
  heightClass = 'h-[540px] sm:h-[640px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { mode: themeMode } = useTheme();
  const { language, t } = useI18n();
  const navigate = useNavigate();

  // Active map style (default to real OSM in light mode, dark in dark mode)
  const [activeStyle, setActiveStyle] = useState<MapStyleKey>(() =>
    themeMode === 'dark' ? 'dark' : 'osm'
  );
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  // Sync style default when theme mode changes if user hasn't explicitly chosen satellite
  useEffect(() => {
    if (activeStyle !== 'satellite') {
      setActiveStyle(themeMode === 'dark' ? 'dark' : 'osm');
    }
  }, [themeMode]);

  // Fit map precisely to the boundaries of India
  const fitToIndia = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(INDIA_BOUNDS, {
        padding: [24, 24],
        maxZoom: 6,
      });
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: INDIA_CENTER,
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
    });

    // Custom Top-Right Zoom Control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Base Tile Layer
    const styleConfig = MAP_STYLES[activeStyle];
    const tileLayer = L.tileLayer(styleConfig.url, {
      attribution: styleConfig.attribution,
      maxZoom: styleConfig.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Fit India on initial load
    map.fitBounds(INDIA_BOUNDS, {
      padding: [20, 20],
      maxZoom: 6,
    });

    // Layer group for station markers
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Invalidate size after layout stabilization
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layer when activeStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const styleConfig = MAP_STYLES[activeStyle];
    tileLayerRef.current.setUrl(styleConfig.url);
  }, [activeStyle]);

  // Update Station Markers when stations prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    stations.forEach((stn) => {
      // Color by status: Normal (green), Above normal (yellow/amber), Severe (orange), Extreme (red)
      let color = '#16a34a'; // normal
      let pulseClass = '';
      let statusBadgeClass = 'bg-emerald-500 text-white';

      if (stn.status === 'Above normal') {
        color = '#ca8a04';
        statusBadgeClass = 'bg-yellow-500 text-white';
      } else if (stn.status === 'Severe') {
        color = '#ea580c';
        pulseClass = 'pulse-severe-marker';
        statusBadgeClass = 'bg-orange-600 text-white';
      } else if (stn.status === 'Extreme') {
        color = '#dc2626';
        pulseClass = 'pulse-extreme-marker';
        statusBadgeClass = 'bg-red-600 text-white';
      }

      // Shape: Circle for river-level, Square for reservoir-inflow
      const isSquare = stn.type === 'reservoir-inflow';
      const borderRadius = isSquare ? '4px' : '50%';
      const shapeTitle = isSquare ? 'Reservoir Inflow' : 'River Level';

      // Custom Leaflet DivIcon
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 28px; height: 28px;">
          <div class="${pulseClass}" style="
            width: ${isSquare ? '20px' : '22px'};
            height: ${isSquare ? '20px' : '22px'};
            background-color: ${color};
            border-radius: ${borderRadius};
            border: 2.5px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
          ">
            <div style="
              width: 5px;
              height: 5px;
              background-color: #ffffff;
              border-radius: ${borderRadius};
            "></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-station-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([stn.latitude, stn.longitude], { icon: customIcon });

      // Interactive Popup
      const displayName = language === 'hi' && stn.hindiName ? stn.hindiName : stn.name;
      const popupHtml = `
        <div class="p-1 min-w-[220px] font-sans text-left">
          <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <span class="font-bold text-xs text-slate-900">${displayName}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass}">${stn.status}</span>
          </div>

          <div class="text-[11px] text-slate-500 mt-1">
            <span>${shapeTitle}</span> • <span>${stn.river} (${stn.basin})</span>
          </div>

          <div class="grid grid-cols-2 gap-2 my-2.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div>
              <span class="text-[10px] text-slate-400 block">Water Level</span>
              <span class="font-extrabold text-slate-900">${stn.currentLevel.toFixed(2)} m</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Danger Level</span>
              <span class="font-bold text-red-600">${stn.dangerLevel.toFixed(2)} m</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">HFL (Peak)</span>
              <span class="font-semibold text-slate-700">${stn.hfl.toFixed(2)} m</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Trend</span>
              <span class="font-semibold text-slate-800">${stn.trend}</span>
            </div>
          </div>

          <button
            id="popup-btn-${stn.id}"
            class="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors text-center cursor-pointer shadow-xs block"
          >
            ${t.viewDetails} →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${stn.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/stations/${stn.id}`);
          };
        }
        if (onSelectStation) {
          onSelectStation(stn);
        }
      });

      marker.addTo(markersGroup);
    });
  }, [stations, language, t, navigate, onSelectStation]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-950">
      {/* Real Cartographic Leaflet Map */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />

      {/* Top-Left Floating Controls: Layer Selector & Fit to India */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {/* Fit to India Button */}
        <button
          onClick={fitToIndia}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-md cursor-pointer transition-all active:scale-95"
          title="Reset View to All India"
        >
          <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Fit India</span>
        </button>

        {/* Map Layer Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsStyleMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-md cursor-pointer transition-all active:scale-95"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">{MAP_STYLES[activeStyle].label}</span>
          </button>

          {isStyleMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 animate-in fade-in slide-from-top-1 text-xs">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cartographic Layer
              </div>
              {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => {
                const style = MAP_STYLES[key];
                const isActive = activeStyle === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveStyle(key);
                      setIsStyleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{style.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Map Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200 dark:border-slate-800 text-[11px] select-none">
        <div className="font-bold text-slate-900 dark:text-white mb-2">
          {language === 'hi' ? 'मानचित्र संकेतक' : 'Map Legend'}
        </div>

        {/* Status Colors */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">{t.statusNormal}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-slate-700 dark:text-slate-300">{t.statusAboveNormal}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
            <span className="text-slate-700 dark:text-slate-300">{t.statusSevere}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="text-slate-700 dark:text-slate-300">{t.statusExtreme}</span>
          </div>
        </div>

        {/* Station Types Shapes */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 flex items-center justify-between gap-3 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-600 dark:border-slate-300" />
            <span>River Level</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs border-2 border-slate-600 dark:border-slate-300" />
            <span>Reservoir Inflow</span>
          </div>
        </div>
      </div>
    </div>
  );
};
