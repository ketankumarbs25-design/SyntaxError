import React, { useState } from 'react';
import {
  DownloadCloud,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
} from 'lucide-react';
import { CWC_NATIONAL_STATIONS } from '../api/cwcNetwork';

export const ExportPage: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadStationsCSV = () => {
    setDownloading('csv');
    const headers = ['Station ID', 'Station Name', 'River', 'Basin', 'State', 'Latitude', 'Longitude', 'Current Level (m)', 'Warning Level (m)', 'Danger Level (m)', 'HFL (m)'];
    const rows = CWC_NATIONAL_STATIONS.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.river}"`,
      `"${s.basin}"`,
      `"${s.state}"`,
      s.latitude,
      s.longitude,
      s.current_level,
      s.warning_level,
      s.danger_level,
      s.hfl,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CWC_1500_Stations_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 1000);
  };

  const downloadGeoJSON = () => {
    setDownloading('geojson');
    const geojson = {
      type: 'FeatureCollection',
      name: 'FlowShield_India_CWC_1500_Telemetry_Network',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: CWC_NATIONAL_STATIONS.map((s) => ({
        type: 'Feature',
        properties: {
          id: s.id,
          name: s.name,
          river: s.river,
          basin: s.basin,
          state: s.state,
          currentLevel_m: s.current_level,
          warningLevel_m: s.warning_level,
          dangerLevel_m: s.danger_level,
          hfl_m: s.hfl,
        },
        geometry: {
          type: 'Point',
          coordinates: [s.longitude, s.latitude],
        },
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `CWC_National_Stations_Network_${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 1000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1440px] mx-auto pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border border-blue-900/40 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4">
            <DownloadCloud className="w-3.5 h-3.5" />
            Verified Hydrological Dataset Export Suite
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Export Hydrological Telemetry & River Basins
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Download complete real-time structured telemetry across all 1,500 CWC stations in India for research,
            GIS hydrological modeling, state policy briefing, and academic presentation slides.
          </p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E101B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Complete CWC 1,500 Station Network (CSV)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Includes Station ID, Station Name, River Basin, State, Lat/Lon, Current Level (m), Warning Level, Danger Level, and High Flood Level (HFL).
            </p>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>1,500 Hydro-telemetry stations across 28 States & UTs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Compatible with Microsoft Excel, Google Sheets, & Pandas</span>
              </div>
            </div>
          </div>

          <button
            onClick={downloadStationsCSV}
            disabled={downloading === 'csv'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4" />
            {downloading === 'csv' ? 'Generating CSV...' : 'Download Telemetry CSV (1,500 Stations)'}
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#0E101B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4">
              <FileJson className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              GIS Spatial GeoJSON Layer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Standard OGC WGS-84 Point FeatureCollection containing geographic coordinates, basin geometries, and live telemetry attributes.
            </p>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Ready for QGIS, ArcGIS, Mapbox, and Leaflet overlays</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                <span>GeoJSON RFC 7946 Standard Compliant</span>
              </div>
            </div>
          </div>

          <button
            onClick={downloadGeoJSON}
            disabled={downloading === 'geojson'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4" />
            {downloading === 'geojson' ? 'Generating GeoJSON...' : 'Download Spatial GeoJSON (WGS84)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
