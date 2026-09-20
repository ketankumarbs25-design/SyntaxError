import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  RotateCcw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { getStations, getBulletins } from '../api/adapter';
import { IndiaFloodMap } from '../components/map/IndiaFloodMap';
import { NeedsAttentionList } from '../components/home/NeedsAttentionList';
import { AlertTicker } from '../components/common/AlertTicker';
import { useI18n } from '../i18n';
import { ZentraAnalyticsHero } from '../components/dashboard/ZentraAnalyticsHero';

export const HomePage: React.FC = () => {
  const { t } = useI18n();

  // Multi-facet filter states
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBasin, setSelectedBasin] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // TanStack Query with 3-minute auto-refresh interval
  const {
    data: stations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['stations'],
    queryFn: getStations,
    refetchInterval: 3 * 60 * 1000, // 3 minutes
  });

  const { data: bulletins = [] } = useQuery({
    queryKey: ['bulletins'],
    queryFn: getBulletins,
    refetchInterval: 3 * 60 * 1000,
  });

  // Extract unique basins and states for filters
  const basins = useMemo(() => {
    return Array.from(new Set(stations.map((s) => s.basin))).filter(Boolean).sort();
  }, [stations]);

  const states = useMemo(() => {
    return Array.from(new Set(stations.map((s) => s.state))).filter(Boolean).sort();
  }, [stations]);

  // Filtered station list
  const filteredStations = useMemo(() => {
    return stations.filter((stn) => {
      if (selectedType !== 'all' && stn.type !== selectedType) return false;
      if (selectedStatus !== 'all' && stn.status !== selectedStatus) return false;
      if (selectedBasin !== 'all' && stn.basin !== selectedBasin) return false;
      if (selectedState !== 'all' && stn.state !== selectedState) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = stn.name.toLowerCase().includes(q);
        const matchesHi = stn.hindiName?.toLowerCase().includes(q);
        const matchesRiver = stn.river.toLowerCase().includes(q);
        const matchesDistrict = stn.district.toLowerCase().includes(q);
        const matchesCode = stn.code.toLowerCase().includes(q);
        return matchesName || matchesHi || matchesRiver || matchesDistrict || matchesCode;
      }

      return true;
    });
  }, [stations, selectedType, selectedStatus, selectedBasin, selectedState, searchQuery]);

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedBasin('all');
    setSelectedState('all');
    setSearchQuery('');
  };

  const handleHeroSelectTag = (tag: string) => {
    if (tag.includes('severe')) {
      setSelectedStatus('Severe');
    } else if (tag.includes('brahmaputra')) {
      setSelectedBasin('Brahmaputra');
    } else if (tag.includes('radar')) {
      setSearchQuery('radar');
    } else if (tag.includes('anomaly')) {
      setSelectedStatus('Extreme');
    }
  };

  const hasActiveFilters =
    selectedType !== 'all' ||
    selectedStatus !== 'all' ||
    selectedBasin !== 'all' ||
    selectedState !== 'all' ||
    Boolean(searchQuery.trim());

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading live India flood telemetry...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h3 className="font-bold text-base text-red-900 dark:text-red-200">Unable to load telemetry</h3>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 mb-4">
          Failed to connect to the flood forecast API. Please check your network connection.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-red-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Top Live Flood Warning Marquee Ticker ────────────────────────── */}
      <AlertTicker
        bulletins={bulletins}
        severeStations={stations.filter((s) => s.status === 'Extreme' || s.status === 'Severe')}
      />

      {/* ─── Dribbble Zentra Sleek Analytics Hero (Overview + Striped Bars + 4 Metrics) ─ */}
      <ZentraAnalyticsHero onSelectTag={handleHeroSelectTag} />

      {/* ─── Multi-Facet Filter Bar ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="all">{t.typeAll}</option>
              <option value="river-level">River-Level (Circles)</option>
              <option value="reservoir-inflow">Reservoir-Inflow (Squares)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="all">{t.statusAll}</option>
              <option value="Normal">🟢 {t.statusNormal}</option>
              <option value="Above normal">🟡 {t.statusAboveNormal}</option>
              <option value="Severe">🟠 {t.statusSevere}</option>
              <option value="Extreme">🔴 {t.statusExtreme}</option>
            </select>
          </div>

          {/* Basin Filter */}
          <div>
            <select
              value={selectedBasin}
              onChange={(e) => setSelectedBasin(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="all">{t.allBasins}</option>
              {basins.map((b) => (
                <option key={b} value={b}>
                  {b} Basin
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="all">{t.allStates}</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredStations.length}</span> of {stations.length} stations
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Main Content Grid: Interactive Map + Needs Attention Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Leaflet India Map */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Live National Hydrographic Map
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({filteredStations.length} stations displayed)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Auto-refreshing (3m)</span>
            </div>
          </div>

          <IndiaFloodMap stations={filteredStations} />
        </div>

        {/* Right 1 Col: Needs Attention List */}
        <div className="lg:col-span-1">
          <NeedsAttentionList stations={stations} />
        </div>
      </div>
    </div>
  );
};
