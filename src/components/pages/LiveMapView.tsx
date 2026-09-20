import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Minus,
  Crosshair,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import type { SectorLiveMetrics } from '../../lib/liveDataSource';
import type { NavTabId } from '../nav/Navbar';

interface LiveMapViewProps {
  sectors?: SectorLiveMetrics[];
  selectedSector?: SectorLiveMetrics | null;
  onSelectSector?: (sector: SectorLiveMetrics) => void;
  onNavigateTab?: (tab: NavTabId) => void;
  lastUpdatedStr?: string;
}

interface MapMarker {
  id: string;
  name: string;
  xPercent: number;
  yPercent: number;
  status: 'Safe' | 'Warning' | 'Critical';
  waterLevel?: string;
  showLabel?: boolean;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  sectors = [],
  onSelectSector = () => {},
  onNavigateTab = () => {},
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  const [mapLayer, setMapLayer] = useState<'OSM Map' | 'Satellite'>('OSM Map');

  // Exact markers and label positions from Screenshot 2
  const mapMarkers: MapMarker[] = [
    { id: 'm-yelahanka', name: 'Yelahanka', xPercent: 37.5, yPercent: 21, status: 'Safe' },
    { id: 'm-warn-ne', name: 'Kalyan Nagar', xPercent: 53.5, yPercent: 22.5, status: 'Warning', waterLevel: '0.28 m' },
    { id: 'm-hebbal', name: 'Hebbal', xPercent: 43.5, yPercent: 46, status: 'Safe' },
    { id: 'm-crit-w', name: 'Vijayanagar', xPercent: 26.5, yPercent: 61, status: 'Critical', waterLevel: '0.45 m' },
    { id: 'm-safe-w', name: 'Chandra Layout', xPercent: 33, yPercent: 55, status: 'Safe' },
    { id: 'm-marathahalli', name: 'Marathahalli', xPercent: 59.5, yPercent: 56.5, status: 'Critical', waterLevel: '0.42 m' },
    { id: 'm-warn-s', name: 'BTM Layout', xPercent: 40.5, yPercent: 71, status: 'Warning', waterLevel: '0.31 m' },
    { id: 'm-hsr', name: 'HSR Layout', xPercent: 50.5, yPercent: 61.5, status: 'Safe' },
    { id: 'm-bellandur', name: 'Bellandur Gate', xPercent: 54, yPercent: 65.5, status: 'Safe' },
    { id: 'm-warn-ec', name: 'Kudlu Gate', xPercent: 56.5, yPercent: 82.5, status: 'Warning', waterLevel: '0.29 m' },
  ];

  // The active popup in Screenshot 2 is on Marathahalli
  const [activePopup, setActivePopup] = useState<MapMarker | null>(
    mapMarkers.find((m) => m.name === 'Marathahalli') || mapMarkers[5]
  );

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.85));
  const handleResetZoom = () => setZoomLevel(1);

  const handleOpenSectorDetails = (markerName: string) => {
    const foundSector = sectors.find((s) => s.name.toLowerCase().includes(markerName.toLowerCase()))
      || sectors.find((s) => s.name === 'Marathahalli')
      || sectors[0];
    onSelectSector(foundSector);
    onNavigateTab('sector-details');
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Title & Subtitle (exact match from Screenshot 2) */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1F38] dark:text-white tracking-tight">
          Live Map
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Explore real-time water levels, sector status and risk zones across Bengaluru.
        </p>
      </div>

      {/* Main Map Box Container */}
      <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm bg-[#EBF1ED] dark:bg-slate-900 select-none">
        {/* Scalable Map Surface */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
          style={{
            transform: `scale(${zoomLevel})`,
            backgroundImage: `url('/bengaluru_map_bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Subtle drainage/satellite layer tints if chosen */}
          {mapLayer === 'Satellite' && (
            <div className="absolute inset-0 bg-emerald-950/25 pointer-events-none" />
          )}

          {/* Exact Bengaluru Geographic Neighborhood Text Labels (matches Screenshot 2) */}
          <div className="absolute top-[17%] left-[47%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Yelahanka</span>
          </div>

          <div className="absolute top-[40%] left-[42%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Hebbal</span>
          </div>

          <div className="absolute top-[48%] left-[64%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">KR Puram</span>
          </div>

          <div className="absolute top-[47%] left-[79%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Whitefield</span>
          </div>

          {/* Central Bold City Name */}
          <div className="absolute top-[54%] left-[47%] -translate-x-1/2 pointer-events-none">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide">
              Bengaluru
            </span>
          </div>

          <div className="absolute top-[60%] left-[39%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Jayanagar</span>
          </div>

          <div className="absolute top-[72%] left-[23%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rajarajeshwari Nagar</span>
          </div>

          <div className="absolute top-[71%] left-[54%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">HSR Layout</span>
          </div>

          <div className="absolute top-[77%] left-[63%] -translate-x-1/2 pointer-events-none">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Electronic City</span>
          </div>

          {/* Interactive Glowing Radar Markers */}
          {mapMarkers.map((marker) => {
            const isSelected = activePopup?.id === marker.id;

            let haloBg = 'rgba(74, 222, 128, 0.4)';
            let dotBg = 'bg-[#16A34A]';
            let dotBorder = 'border-[#22C55E]';

            if (marker.status === 'Warning') {
              haloBg = 'rgba(251, 191, 36, 0.45)';
              dotBg = 'bg-[#EAB308]';
              dotBorder = 'border-[#FBBF24]';
            } else if (marker.status === 'Critical') {
              haloBg = 'rgba(248, 113, 113, 0.5)';
              dotBg = 'bg-[#DC2626]';
              dotBorder = 'border-[#EF4444]';
            }

            return (
              <div
                key={marker.id}
                onClick={() => setActivePopup(marker)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                style={{
                  left: `${marker.xPercent}%`,
                  top: `${marker.yPercent}%`,
                }}
              >
                {/* Outer Glow Halo Ring */}
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-125"
                  style={{ backgroundColor: haloBg }}
                >
                  {/* Inner Solid Pin */}
                  <div
                    className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full ${dotBg} border-2 ${dotBorder} text-white flex items-center justify-center shadow-md ${
                      isSelected ? 'ring-2 ring-white scale-110' : ''
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-80" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top-Left Overlay Card: All Sectors (32) (exact match from Screenshot 2) */}
        <div className="absolute top-4 left-4 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-200/80 dark:border-slate-800 min-w-[155px]">
          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-2.5">
            All Sectors (32)
          </div>
          <div className="space-y-2 text-xs">
            {/* Safe 24 */}
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-3 h-3 rounded-full border-2 border-[#16A34A] flex items-center justify-center text-[8px] text-[#16A34A] font-bold">
                  ✓
                </span>
                Safe
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">24</span>
            </div>

            {/* Warning 5 */}
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-3 h-3 rounded-full border-2 border-[#EAB308] flex items-center justify-center text-[8px] text-[#EAB308] font-bold">
                  !
                </span>
                Warning
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">5</span>
            </div>

            {/* Critical 3 */}
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-3 h-3 rounded-full border-2 border-[#DC2626] flex items-center justify-center text-[8px] text-[#DC2626] font-bold">
                  !
                </span>
                Critical
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100">3</span>
            </div>
          </div>
        </div>

        {/* Top-Right Overlay: Map View Dropdown (exact match from Screenshot 2) */}
        <div className="absolute top-4 right-4 z-30">
          <div className="relative">
            <button
              onClick={() => setShowLayerDropdown(!showLayerDropdown)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <span>{mapLayer}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <AnimatePresence>
              {showLayerDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-40 text-xs"
                >
                  {(['OSM Map', 'Satellite'] as const).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => {
                        setMapLayer(layer);
                        setShowLayerDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
                    >
                      {layer}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom-Right Overlay: Zoom Controls + Compass Icon (matches Screenshot 2) */}
        <div className="absolute bottom-14 right-4 z-30 flex flex-col gap-2">
          {/* Zoom In / Out Pill */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Compass / Recenter Button */}
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-100 cursor-pointer transition-colors"
            title="Recenter"
          >
            <Crosshair className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Sector Popup on Map (exact match for Marathahalli in Screenshot 2) */}
        <AnimatePresence>
          {activePopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute z-30 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-slate-200/90 dark:border-slate-800 min-w-[220px] max-w-[260px]"
              style={{
                left: `${Math.min(Math.max(activePopup.xPercent - 2, 12), 64)}%`,
                top: `${Math.min(Math.max(activePopup.yPercent - 2, 18), 64)}%`,
              }}
            >
              {/* Header: Red/Yellow/Green Dot + Sector Name */}
              <div className="flex items-center gap-2 pb-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activePopup.status === 'Critical'
                      ? 'bg-red-500 ring-2 ring-red-200'
                      : activePopup.status === 'Warning'
                      ? 'bg-amber-500 ring-2 ring-amber-200'
                      : 'bg-emerald-500 ring-2 ring-emerald-200'
                  }`}
                />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {activePopup.name}
                </span>
              </div>

              {/* Data Row: Water Level & Status */}
              <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Water Level</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mt-0.5">
                    {activePopup.waterLevel || '0.42 m'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Status</div>
                  <div
                    className={`font-bold text-xs sm:text-sm mt-0.5 ${
                      activePopup.status === 'Critical'
                        ? 'text-[#DC2626]'
                        : activePopup.status === 'Warning'
                        ? 'text-[#D97706]'
                        : 'text-[#16A34A]'
                    }`}
                  >
                    {activePopup.status}
                  </div>
                </div>
              </div>

              {/* View Details Link */}
              <button
                onClick={() => handleOpenSectorDetails(activePopup.name)}
                className="text-[#1D4ED8] dark:text-blue-400 font-semibold text-xs flex items-center gap-1 hover:underline cursor-pointer pt-1"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Bottom Footer Bar (matches Screenshot 2) */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-200">Real-time data</span>
            <span className="text-slate-400">✦</span>
            <span className="text-slate-500">Updated 2 min ago</span>
          </div>
          <div className="hidden sm:block text-slate-400 text-[11px]">
            Click on a sector to view details
          </div>
        </div>
      </div>
    </div>
  );
};
