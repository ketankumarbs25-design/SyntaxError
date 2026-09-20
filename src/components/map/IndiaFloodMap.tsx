import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import type { Station } from '../../api/types';
import { INDIA_OFFICIAL_GEOJSON } from '../../data/indiaOfficialGeoJSON';
import { useTheme } from '../../hooks/useTheme';
import { useI18n } from '../../i18n';
import { Layers, Compass, Globe } from 'lucide-react';

interface IndiaFloodMapProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
  heightClass?: string;
}

export type MapStyleKey = 'satellite' | 'osm';

interface MapStyleConfig {
  id: MapStyleKey;
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const MAP_STYLES: Record<MapStyleKey, MapStyleConfig> = {
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
  osm: {
    id: 'osm',
    label: 'OSM map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors | Survey of India Boundary',
    maxZoom: 19,
  },
};

// India geographic bounds (encompassing Jammu & Kashmir, Ladakh, Arunachal, Kutch, and South)
const INDIA_BOUNDS: L.LatLngBoundsLiteral = [
  [8.0, 68.7],
  [35.5, 97.4],
];
const INDIA_CENTER: [number, number] = [22.8, 80.0];

const SEVERITY_COLORS = {
  Normal: '#1E7F4A',
  'Above normal': '#F2C230',
  Severe: '#F08A24',
  Extreme: '#C62828',
};

const SEVERITY_RANK: Record<string, number> = {
  Normal: 1,
  'Above normal': 2,
  Severe: 3,
  Extreme: 4,
};

export const IndiaFloodMap: React.FC<IndiaFloodMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  heightClass = 'h-[540px] sm:h-[640px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const { mode: themeMode } = useTheme();
  const { language, t } = useI18n();
  const navigate = useNavigate();

  const [activeStyle, setActiveStyle] = useState<MapStyleKey>('satellite');

  // Fit map precisely to the official boundaries of India
  const fitToIndia = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(INDIA_BOUNDS, {
        padding: [16, 16],
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

    L.control.zoom({ position: 'topright' }).addTo(map);

    const styleConfig = MAP_STYLES[activeStyle];
    const tileLayer = L.tileLayer(styleConfig.url, {
      attribution: styleConfig.attribution,
      maxZoom: styleConfig.maxZoom,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Fit India on initial load
    map.fitBounds(INDIA_BOUNDS, {
      padding: [16, 16],
      maxZoom: 6,
    });

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    const timer1 = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(INDIA_BOUNDS, { padding: [16, 16], maxZoom: 6 });
    }, 150);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
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

  // Render official Survey of India boundary
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const isDark = themeMode === 'dark' || activeStyle === 'satellite';
    const borderColor = activeStyle === 'satellite' ? '#60a5fa' : isDark ? '#38bdf8' : '#1d4ed8';
    const fillColor = activeStyle === 'satellite' ? '#3b82f6' : isDark ? '#0284c7' : '#3b82f6';

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle({
        color: borderColor,
        fillColor: fillColor,
      });
      return;
    }

    const geoJsonLayer = L.geoJSON(INDIA_OFFICIAL_GEOJSON, {
      style: () => ({
        color: borderColor,
        weight: 1.5,
        opacity: 0.8,
        fillColor: fillColor,
        fillOpacity: 0.03,
      }),
      onEachFeature: (feature, layer) => {
        const stateName = feature.properties?.st_nm || 'India';
        layer.bindTooltip(
          `<div class="font-sans text-xs font-semibold text-[var(--text)]">${stateName}</div>`,
          {
            sticky: true,
            className:
              'bg-[var(--surface)] text-[var(--text)] shadow-md rounded-lg px-2 py-1 border border-[var(--border)]',
          }
        );
      },
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;
  }, [themeMode, activeStyle]);

  // Cluster and render markers
  const renderMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    const currentZoom = map.getZoom();

    // Determine cluster grid cell size based on current zoom
    let gridSize = 0;
    if (currentZoom <= 4) gridSize = 2.0;
    else if (currentZoom === 5) gridSize = 1.3;
    else if (currentZoom === 6) gridSize = 0.7;
    else if (currentZoom === 7) gridSize = 0.35;
    else gridSize = 0; // Zoom >= 8: individual stations

    if (gridSize === 0) {
      // Individual station markers
      stations.forEach((stn) => {
        const color = SEVERITY_COLORS[stn.status as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.Normal;
        const isPulse = stn.status === 'Extreme' || stn.status === 'Severe';
        const isSquare = stn.type === 'reservoir-inflow';
        const isSelected = selectedStationId === stn.id;

        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer" style="width: 22px; height: 22px;">
            ${
              isPulse
                ? `<span class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: ${color};"></span>`
                : ''
            }
            <div style="
              width: ${isSelected ? '16px' : '12px'};
              height: ${isSelected ? '16px' : '12px'};
              background-color: ${color};
              border-radius: ${isSquare ? '3px' : '50%'};
              border: 1.5px solid #FFFFFF;
              box-shadow: 0 1px 4px rgba(0,0,0,0.35);
              transition: transform 0.2s ease;
            "></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'flood-station-dot',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -11],
        });

        const marker = L.marker([stn.latitude, stn.longitude], { icon: customIcon });

        const displayName = language === 'hi' && stn.hindiName ? stn.hindiName : stn.name;
        const popupHtml = `
          <div class="p-2 min-w-[210px] font-sans text-left bg-[var(--surface)] text-[var(--text)] rounded-xl border border-[var(--border)] shadow-xl">
            <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-[var(--border)]">
              <span class="font-semibold text-xs text-[var(--text)]">${displayName}</span>
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-md text-white whitespace-nowrap" style="background-color: ${color};">
                ${stn.status}
              </span>
            </div>

            <div class="text-[11px] text-[var(--text-muted)] mt-1.5">
              <span>${stn.type === 'reservoir-inflow' ? 'Reservoir' : 'River gauge'}</span> • <span>${stn.river} (${stn.basin})</span>
            </div>

            <div class="grid grid-cols-2 gap-2 my-2 text-xs bg-[var(--surface-2)] p-2 rounded-lg border border-[var(--border)]">
              <div>
                <span class="text-[10px] text-[var(--text-muted)] block">Water level</span>
                <span class="font-mono font-medium text-[var(--text)] tabular-nums">${stn.currentLevel.toFixed(2)} m</span>
              </div>
              <div>
                <span class="text-[10px] text-[var(--text-muted)] block">Danger level</span>
                <span class="font-mono font-medium text-[var(--text)] tabular-nums">${stn.dangerLevel.toFixed(2)} m</span>
              </div>
            </div>

            <button
              id="popup-btn-${stn.id}"
              class="w-full py-1.5 px-3 rounded-lg bg-[var(--primary)] hover:brightness-110 text-white font-medium text-xs transition-all text-center cursor-pointer shadow-xs block"
            >
              ${t.viewDetails} →
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          maxWidth: 260,
          className: 'flood-popup-custom',
        });

        marker.on('click', () => {
          map.flyTo([stn.latitude, stn.longitude], Math.max(map.getZoom(), 8), { duration: 0.6 });
          if (onSelectStation) onSelectStation(stn);
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-btn-${stn.id}`);
          if (btn) {
            btn.onclick = () => navigate(`/stations/${stn.id}`);
          }
        });

        marker.addTo(markersGroup);
      });
    } else {
      // Grid clustering
      const clusters: Record<
        string,
        {
          stations: Station[];
          sumLat: number;
          sumLng: number;
          highestSeverity: string;
        }
      > = {};

      stations.forEach((stn) => {
        const gridKey = `${Math.floor(stn.latitude / gridSize)}_${Math.floor(stn.longitude / gridSize)}`;
        if (!clusters[gridKey]) {
          clusters[gridKey] = {
            stations: [],
            sumLat: 0,
            sumLng: 0,
            highestSeverity: stn.status,
          };
        }
        const c = clusters[gridKey];
        c.stations.push(stn);
        c.sumLat += stn.latitude;
        c.sumLng += stn.longitude;

        if ((SEVERITY_RANK[stn.status] || 0) > (SEVERITY_RANK[c.highestSeverity] || 0)) {
          c.highestSeverity = stn.status;
        }
      });

      Object.values(clusters).forEach((c) => {
        const count = c.stations.length;
        const avgLat = c.sumLat / count;
        const avgLng = c.sumLng / count;
        const color =
          SEVERITY_COLORS[c.highestSeverity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.Normal;

        if (count === 1) {
          const stn = c.stations[0];
          const isPulse = stn.status === 'Extreme' || stn.status === 'Severe';
          const isSquare = stn.type === 'reservoir-inflow';

          const markerHtml = `
            <div class="relative flex items-center justify-center cursor-pointer" style="width: 22px; height: 22px;">
              ${
                isPulse
                  ? `<span class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: ${color};"></span>`
                  : ''
              }
              <div style="
                width: 12px;
                height: 12px;
                background-color: ${color};
                border-radius: ${isSquare ? '3px' : '50%'};
                border: 1.5px solid #FFFFFF;
                box-shadow: 0 1px 4px rgba(0,0,0,0.35);
              "></div>
            </div>
          `;

          const customIcon = L.divIcon({
            html: markerHtml,
            className: 'flood-station-dot',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            popupAnchor: [0, -11],
          });

          const marker = L.marker([stn.latitude, stn.longitude], { icon: customIcon });

          marker.on('click', () => {
            map.flyTo([stn.latitude, stn.longitude], Math.max(map.getZoom(), 8), { duration: 0.6 });
            if (onSelectStation) onSelectStation(stn);
          });

          marker.addTo(markersGroup);
        } else {
          // Cluster bubble with count
          const clusterHtml = `
            <div class="flex items-center justify-center cursor-pointer rounded-full shadow-md" style="
              width: 28px;
              height: 28px;
              background-color: ${color};
              border: 2px solid rgba(255, 255, 255, 0.9);
              color: ${c.highestSeverity === 'Above normal' ? '#0B1F33' : '#FFFFFF'};
              font-family: inherit;
              font-size: 11px;
              font-weight: 600;
              transition: transform 0.2s ease;
            ">
              ${count}
            </div>
          `;

          const clusterIcon = L.divIcon({
            html: clusterHtml,
            className: 'flood-cluster-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([avgLat, avgLng], { icon: clusterIcon });
          marker.on('click', () => {
            map.flyTo([avgLat, avgLng], Math.min(map.getZoom() + 2, 10), { duration: 0.5 });
          });

          marker.addTo(markersGroup);
        }
      });
    }
  }, [stations, selectedStationId, language, t, navigate, onSelectStation]);

  // Hook markers render to stations update and zoom changes
  useEffect(() => {
    renderMarkers();

    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      map.on('zoomend', renderMarkers);
      return () => {
        map.off('zoomend', renderMarkers);
      };
    }
  }, [renderMarkers]);

  // Fly-to animation when selectedStationId changes externally
  useEffect(() => {
    if (!selectedStationId || !mapInstanceRef.current) return;
    const target = stations.find((s) => s.id === selectedStationId);
    if (target) {
      mapInstanceRef.current.flyTo([target.latitude, target.longitude], 9, {
        duration: 0.7,
      });
    }
  }, [selectedStationId, stations]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[var(--border)] shadow-xs bg-[var(--surface)]">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />

      {/* Top-Left Floating Controls: Fit India & Satellite/OSM */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={fitToIndia}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] text-xs font-medium rounded-lg shadow-sm border border-[var(--border)] cursor-pointer transition-all active:scale-95"
          title="Fit view to India"
        >
          <Compass className="w-3.5 h-3.5 text-[var(--live)]" />
          <span className="hidden sm:inline">Fit India</span>
        </button>

        <div className="flex items-center p-0.5 bg-[var(--surface)] rounded-lg shadow-sm border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveStyle('satellite')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeStyle === 'satellite'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStyle('osm')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeStyle === 'osm'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>OSM map</span>
          </button>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('fs-replay-intro'));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--live)] hover:text-[var(--text)] transition-all cursor-pointer"
            title="Launch 3D Satellite Earth Globe"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--live)] animate-spin [animation-duration:18s]" />
            <span>3D Earth</span>
          </button>
        </div>
      </div>

      {/* Floating Map Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-20 bg-[var(--surface)] rounded-xl p-3 shadow-md border border-[var(--border)] text-[11px] select-none">
        <div className="font-medium text-xs text-[var(--text)] mb-2">
          {language === 'hi' ? 'मानचित्र संकेतक' : 'Map legend'}
        </div>

        {/* Status Colors */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--normal)]" />
            <span className="text-[var(--text-muted)]">{t.statusNormal}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--watch)]" />
            <span className="text-[var(--text-muted)]">{t.statusAboveNormal}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]" />
            <span className="text-[var(--text-muted)]">{t.statusSevere}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)] animate-pulse" />
            <span className="text-[var(--text-muted)]">{t.statusExtreme}</span>
          </div>
        </div>

        {/* Station Types Shapes */}
        <div className="border-t border-[var(--border)] pt-2 mt-2 flex items-center justify-between gap-3 text-[var(--text-muted)] text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-[var(--text-muted)]" />
            <span>River level</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs border border-[var(--text-muted)]" />
            <span>Reservoir inflow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaFloodMap;
