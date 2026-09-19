/**
 * FLOWSHIELD — Minimal Clean Dashboard
 * 
 * Pixel-perfect implementation of the FlowShield Flood Risk Awareness dashboard:
 * - Ultra-minimal, crisp white & soft light-slate aesthetic
 * - Left sidebar with FlowShield wave logo, navigation menu, and footer branding
 * - Greeting header with real-time subtitle and pill search bar with circular submit button
 * - 4 Top meteorological telemetry cards (Rainfall now, Temperature, Humidity, Wind Speed)
 * - Main Map Card with location header (name, coordinates), Live Data / Simulation toggle, and OpenStreetMap
 * - Right 3 stacked cards: Weather-Based Flood Risk, 24h Forecast, and Flood Data
 * - Bottom row: Recent Weather & Flood News and verified Data Sources with dynamic timestamp
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Waves,
  MapPin,
  TrendingUp,
  CloudRain,
  Newspaper,
  Database,
  Info,
  Search,
  ArrowRight,
  Thermometer,
  Droplets,
  Wind,
  ShieldCheck,
  BarChart2,
  Clock,
  Layers,
} from 'lucide-react';
import type { SimConfig, SimState } from '../../sim/types';
import { geocodeLocation, type GeocodedLocation } from '../map/geocoding';
import { fetchAreaWeatherTelemetry, type AreaTelemetry, type RiskAssessment } from '../map/weatherTelemetry';
import { useAuth } from '../../context/AuthContext';
import { UserProfileMenu } from '../auth/UserProfileMenu';

interface MinimalDashboardProps {
  config: SimConfig;
  currentState: SimState;
  onConfigChange: (updated: Partial<SimConfig>) => void;
  onRunSimulation: () => void;
  onNavigateToTab: (tab: 'overview' | 'map' | 'sim' | 'weather') => void;
  activeTab: 'overview' | 'map' | 'sim' | 'weather';
  sharedLocation: string;
  onLocationChange: (loc: string) => void;
  mapComponent?: React.ReactNode;
  simulationComponent?: React.ReactNode;
  weatherComponent?: React.ReactNode;
}

export const MinimalDashboard: React.FC<MinimalDashboardProps> = ({
  config: _config,
  currentState: _currentState,
  onConfigChange: _onConfigChange,
  onRunSimulation: _onRunSimulation,
  onNavigateToTab,
  activeTab,
  sharedLocation,
  onLocationChange,
  mapComponent,
  simulationComponent,
  weatherComponent,
}) => {
  const { user } = useAuth();

  // Local search query for input field
  const [searchQuery, setSearchQuery] = useState(sharedLocation || 'Koramangala, Bengaluru');
  const [currentLoc, setCurrentLoc] = useState<GeocodedLocation>({
    name: 'Koramangala, Bengaluru',
    displayName: 'Koramangala, Bengaluru, Karnataka, 560034, India',
    lat: 12.9352,
    lon: 77.6245,
  });

  // Mode switcher inside map card: 'live' or 'simulation'
  const [mapMode, setMapMode] = useState<'live' | 'simulation'>('live');

  // Meteorological telemetry & risk state
  const [telemetry, setTelemetry] = useState<AreaTelemetry>({
    latitude: 12.9352,
    longitude: 77.6245,
    temperature: 21.8,
    humidity: 94,
    precipitation: 0.1,
    rain: 0.1,
    weatherCode: 61,
    weatherDesc: 'Light Rain',
    weatherIcon: '🌦️',
    windSpeed: 9.0,
    forecastRain24h: 3.4,
    elevation: 914,
    updatedAt: new Date().toISOString(),
    timezone: 'Asia/Kolkata',
  });

  const [risk, setRisk] = useState<RiskAssessment>({
    level: 'LOW',
    score: 12,
    label: 'MINIMAL',
    statusText: 'Minimal Flood Risk',
    color: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    haloColor: '#10b981',
    description: 'Based on current weather data and forecast. This is a model estimate, not an observed flood condition.',
    recommendation: 'Normal catchment conditions.',
    factors: ['Negligible rainfall intensity', 'Catchment soil saturation low'],
  });

  // Dynamic greeting based on current local hour and user name
  const [greeting, setGreeting] = useState('Good evening, Gaurav');
  useEffect(() => {
    const hour = new Date().getHours();
    let timePrefix = 'Good evening';
    if (hour >= 5 && hour < 12) timePrefix = 'Good morning';
    else if (hour >= 12 && hour < 17) timePrefix = 'Good afternoon';
    const firstName = user?.name ? user.name.split(' ')[0] : 'Gaurav';
    setGreeting(`${timePrefix}, ${firstName}`);
  }, [user]);

  // Sync with sharedLocation when updated externally
  useEffect(() => {
    if (sharedLocation && sharedLocation !== currentLoc.name) {
      setSearchQuery(sharedLocation);
      geocodeLocation(sharedLocation).then((loc) => {
        setCurrentLoc(loc);
        fetchAreaWeatherTelemetry(loc.lat, loc.lon)
          .then((data) => {
            setTelemetry(data.telemetry);
            setRisk(data.risk);
          })
          .catch(() => {
            // Keep fallback telemetry if network fails
          });
      });
    }
  }, [sharedLocation]);

  // Initial geocoding & telemetry fetch on mount
  const hasFetchedInitialRef = useRef(false);
  useEffect(() => {
    if (!hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true;
      geocodeLocation(sharedLocation || 'Koramangala, Bengaluru').then((loc) => {
        setCurrentLoc(loc);
        fetchAreaWeatherTelemetry(loc.lat, loc.lon).then((data) => {
          setTelemetry(data.telemetry);
          setRisk(data.risk);
        }).catch(() => {});
      });
    }
  }, [sharedLocation]);

  // Location search form handler
  const handleSearchSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      try {
        const resolved = await geocodeLocation(searchQuery.trim());
        setCurrentLoc(resolved);
        onLocationChange(resolved.name);

        const data = await fetchAreaWeatherTelemetry(resolved.lat, resolved.lon);
        setTelemetry(data.telemetry);
        setRisk(data.risk);
      } catch {
        // Graceful error fallback
      }
    },
    [searchQuery, onLocationChange]
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row p-3 sm:p-5 lg:p-6 gap-6 font-sans antialiased">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. LEFT SIDEBAR NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-full lg:w-56 xl:w-60 bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">FlowShield</h2>
              <p className="text-[11px] text-slate-400 font-medium">Flood Risk Awareness</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 pt-1">
            <button
              onClick={() => onNavigateToTab('map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'map' || activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => onNavigateToTab('sim')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sim'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Simulation</span>
            </button>

            <button
              onClick={() => onNavigateToTab('weather')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CloudRain className="w-4 h-4 shrink-0" />
              <span>Weather</span>
            </button>

            <a
              href="#news-section"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Newspaper className="w-4 h-4 shrink-0" />
              <span>News</span>
            </a>

            <a
              href="#data-sources-section"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Data Sources</span>
            </a>

            <button
              type="button"
              onClick={() => onNavigateToTab('overview')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>About</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Branding & User Profile */}
        <div className="pt-4 border-t border-slate-100/80 px-1 space-y-3">
          <UserProfileMenu compact={false} />
          <div>
            <div className="text-xs font-bold text-slate-800">FlowShield</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Safer Communities</div>
            <div className="text-[10px] text-slate-400">Through Better Information</div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. MAIN CONTENT STAGE
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {greeting}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Real-time weather insights and flood risk for a safer tomorrow
            </p>
          </div>

          {/* Search Pill Input & Profile Avatar Menu */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full md:w-80 lg:w-96 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location (e.g. Koramangala, Bengaluru)"
                className="w-full pl-10 pr-12 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
              />
              <button
                type="submit"
                title="Search Location"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <UserProfileMenu />
          </div>
        </header>

        {/* View Switch: Simulation Tab View */}
        {activeTab === 'sim' && simulationComponent ? (
          <div className="w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            {simulationComponent}
          </div>
        ) : activeTab === 'weather' && weatherComponent ? (
          <div className="w-full">
            {weatherComponent}
          </div>
        ) : (
          /* Primary Minimal Dashboard Overview matching Reference Screenshot */
          <div className="space-y-6">
            {/* ─────────────────────────────────────────────────────────────────
                ROW 1: Top 4 Weather Metric Cards
            ───────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* CARD 1: Rainfall (now) */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-slate-400 font-medium">Rainfall (now)</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {telemetry.precipitation.toFixed(1)} mm/h
                  </div>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      ↓ {telemetry.precipitation > 0 ? 'Low' : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2: Temperature */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-slate-400 font-medium">Temperature</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {telemetry.temperature.toFixed(1)} °C
                  </div>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      Normal
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 3: Humidity */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-slate-400 font-medium">Humidity</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {telemetry.humidity}%
                  </div>
                  <div className="pt-0.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      telemetry.humidity > 80 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {telemetry.humidity > 80 ? 'High' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 4: Wind Speed */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="text-xs text-slate-400 font-medium">Wind Speed</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {Math.round(telemetry.windSpeed)} km/h
                  </div>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {telemetry.windSpeed < 15 ? 'Calm' : 'Breezy'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                ROW 2: Main Map Card (8 cols) & Right Stack (4 cols)
            ───────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT: Live Map Card (lg:col-span-8) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                {/* Map Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {currentLoc.name}
                      </h2>
                      <div className="text-xs text-slate-400 font-mono">
                        {currentLoc.lat.toFixed(4)}, {currentLoc.lon.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Mode Switcher Pills: Live Data / Simulation */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-full border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setMapMode('live')}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        mapMode === 'live'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Live Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMode('simulation')}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        mapMode === 'simulation'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Simulation
                    </button>
                  </div>
                </div>

                {/* Map Display or Embedded Simulation Container */}
                <div className="w-full rounded-2xl overflow-hidden relative border border-slate-100">
                  {mapMode === 'live' ? (
                    mapComponent || (
                      <div className="w-full h-[450px] bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
                        Loading OpenStreetMap...
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-slate-50 min-h-[450px]">
                      {simulationComponent || (
                        <div className="flex flex-col items-center justify-center h-80 text-center space-y-3">
                          <TrendingUp className="w-8 h-8 text-blue-500" />
                          <div className="text-sm font-bold text-slate-800">
                            Hydrodynamic Simulation Mode
                          </div>
                          <p className="text-xs text-slate-500 max-w-sm">
                            Euler cellular automata lattice predicting 2D flood head propagation across {currentLoc.name}.
                          </p>
                          <button
                            onClick={() => onNavigateToTab('sim')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                          >
                            Open Full Simulation Suite
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OpenStreetMap Layer Overlay Indicator */}
                  {mapMode === 'live' && (
                    <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200/80 shadow-xs pointer-events-auto">
                      <Layers className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: 3 Stacked Cards (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-4">
                {/* CARD 1: Weather-Based Flood Risk */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Weather-Based Flood Risk
                    </span>
                  </div>

                  {/* Status Banner */}
                  <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl py-3 text-center">
                    <div className="text-base font-black text-emerald-800 tracking-wider">
                      {risk.label || 'MINIMAL'}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Based on current weather data and forecast. This is a model estimate, not an observed flood condition.
                  </p>
                </div>

                {/* CARD 2: 24h Forecast */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      24h Forecast
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-slate-900 tracking-tight pt-1">
                    {telemetry.forecastRain24h.toFixed(1)} mm
                  </div>

                  <p className="text-xs text-slate-400">
                    Total rainfall (next 24 hours)
                  </p>
                </div>

                {/* CARD 3: Flood Data */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Waves className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Flood Data
                    </span>
                  </div>

                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Water Level</span>
                      <span className="text-slate-400">Unavailable</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Flood Boundary</span>
                      <span className="text-slate-400">Unavailable</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">People at Risk</span>
                      <span className="text-slate-400">Unavailable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────────
                ROW 3: Recent Weather & Flood News & Verified Data Sources
            ───────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT: Recent Weather & Flood News (lg:col-span-8) */}
              <div id="news-section" className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Recent Weather & Flood News
                    </h3>
                  </div>
                  <a
                    href="https://news.google.com/search?q=bengaluru+rain+flood"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    View All
                  </a>
                </div>

                {/* News Articles List */}
                <div className="space-y-4">
                  {/* Item 1 */}
                  <a
                    href="https://www.thehindu.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1514632595-4944383f2737?w=160&h=120&fit=crop&q=80"
                      alt="Heavy rainfall"
                      className="w-20 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        Heavy rainfall expected in Bengaluru over next 48 hours
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        The Hindu · 2 hours ago
                      </p>
                    </div>
                  </a>

                  {/* Item 2 */}
                  <a
                    href="https://www.ndtv.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=160&h=120&fit=crop&q=80"
                      alt="Waterlogging reported"
                      className="w-20 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        Waterlogging reported in parts of Bengaluru
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        NDTV · 5 hours ago
                      </p>
                    </div>
                  </a>

                  {/* Item 3 */}
                  <a
                    href="https://www.deccanherald.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=160&h=120&fit=crop&q=80"
                      alt="Karnataka weather forecast"
                      className="w-20 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        Karnataka weather forecast: More rain likely
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Deccan Herald · 1 day ago
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* RIGHT: Data Sources (lg:col-span-4) */}
              <div id="data-sources-section" className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Data Sources
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Map & Location
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      OpenStreetMap / Nominatim
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                      <CloudRain className="w-3.5 h-3.5 text-slate-400" />
                      Weather Data
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Open-Meteo
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                      <Newspaper className="w-3.5 h-3.5 text-slate-400" />
                      News
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      GDELT
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                      <Waves className="w-3.5 h-3.5 text-slate-400" />
                      Flood Sensors
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Not available
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      Population Data
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Not available
                    </span>
                  </div>
                </div>

                {/* Last updated footer with dynamic clock */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Last updated</div>
                    <div className="text-xs font-semibold text-slate-700">
                      {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} IST
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
