import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import type { Station } from '../../api/types';
import { INDIA_BOUNDARY_GEOJSON, MAJOR_RIVERS } from '../../data/indiaGeoJSON';
import { useTheme } from '../../hooks/useTheme';
import { useI18n } from '../../i18n';

interface IndiaFloodMapProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (station: Station) => void;
  heightClass?: string;
}

export const IndiaFloodMap: React.FC<IndiaFloodMapProps> = ({
  stations,
  onSelectStation,
  heightClass = 'h-[520px] sm:h-[620px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const riversLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);

  const { mode: themeMode } = useTheme();
  const { language, t } = useI18n();
  const navigate = useNavigate();

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on India [22.0, 80.0] with zoom level 5
    const map = L.map(mapContainerRef.current, {
      center: [22.0, 80.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false,
    });

    // Custom Top-Right Zoom Control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Clean Tile Layer (CartoDB Positron for light mode, Dark Matter for dark mode)
    const tileUrl =
      themeMode === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> | &copy; FlowShield Central Water Commission',
      maxZoom: 18,
    }).addTo(map);

    // India Boundary GeoJSON
    const boundary = L.geoJSON(INDIA_BOUNDARY_GEOJSON, {
      style: {
        color: themeMode === 'dark' ? '#38bdf8' : '#0284c7',
        weight: 2,
        opacity: 0.65,
        fillColor: themeMode === 'dark' ? '#0f172a' : '#f0f9ff',
        fillOpacity: 0.08,
      },
    }).addTo(map);
    boundaryLayerRef.current = boundary;

    // Flowing Rivers Layer (with animated dash class)
    const riversGroup = L.layerGroup().addTo(map);
    MAJOR_RIVERS.forEach((river) => {
      const line = L.polyline(river.coordinates, {
        color: river.color,
        weight: 3.5,
        opacity: 0.75,
        className: 'river-flowing-line',
      });
      line.bindTooltip(`${river.name} River (${river.basin} Basin)`, {
        sticky: true,
        className: 'bg-white dark:bg-slate-800 text-xs font-semibold px-2 py-1 rounded shadow',
      });
      line.addTo(riversGroup);
    });
    riversLayerRef.current = riversGroup;

    // Layer group for station markers
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer and Boundary colors on Theme Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Update boundary
    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.setStyle({
        color: themeMode === 'dark' ? '#38bdf8' : '#0284c7',
        weight: 2,
        opacity: 0.65,
        fillColor: themeMode === 'dark' ? '#0f172a' : '#f0f9ff',
        fillOpacity: 0.08,
      });
    }

    // Refresh tiles
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        const newUrl =
          themeMode === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        layer.setUrl(newUrl);
      }
    });
  }, [themeMode]);

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
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
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
        <div class="p-1 min-w-[220px] font-sans">
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
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />

      {/* Floating Legend on Map (Bottom-Left) */}
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
