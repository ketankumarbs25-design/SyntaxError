import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Radio,
} from 'lucide-react';
import { getStations, getBulletins } from '../api/adapter';
import { IndiaFloodMap } from '../components/map/IndiaFloodMap';
import { NeedsAttentionList } from '../components/home/NeedsAttentionList';
import { AlertTicker } from '../components/common/AlertTicker';
import { useI18n } from '../i18n';

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

  // Real KPI Status Counts directly from CWC stations
  const counts = useMemo(() => {
    let normal = 0;
    let above = 0;
    let severe = 0;
    let extreme = 0;

    stations.forEach((s) => {
      if (s.status === 'Extreme') extreme++;
      else if (s.status === 'Severe') severe++;
      else if (s.status === 'Above normal') above++;
      else normal++;
    });

    return { total: stations.length, normal, above, severe, extreme };
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

      {/* ─── Clean Professional Header & Real Telemetry Status ───────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            National Flood Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real-time stage and reservoir inflow monitoring across 1,500 Central Water Commission stations
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--live)] text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-[var(--live)] animate-pulse" />
            <span>Live REST Stream</span>
          </div>
          <span className="text-xs text-[var(--border)]">·</span>
          <span className="text-xs text-[var(--text-muted)]">3-min auto sync</span>
        </div>
      </div>

      {/* ─── 4 Clean Real KPI Metric Cards (Themed with Exact Tokens) ────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[var(--surface)] rounded-xl p-4.5 border border-[var(--border)] shadow-xs">
          <span className="text-xs font-medium text-[var(--text-muted)] block">
            {t.totalStations}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-1">
            {counts.total.toLocaleString()}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Across {basins.length} river basins
          </span>
        </div>

        <div className="bg-[var(--surface)] rounded-xl p-4.5 border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {t.statusNormal}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--level-normal)] shadow-xs" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--level-normal)] mt-1">
            {counts.normal.toLocaleString()}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Below warning thresholds
          </span>
        </div>

        <div className="bg-[var(--surface)] rounded-xl p-4.5 border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {t.statusAboveNormal}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--level-watch)] shadow-xs" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--level-watch)] mt-1">
            {counts.above.toLocaleString()}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Approaching warning stage
          </span>
        </div>

        <div className="bg-[var(--surface)] rounded-xl p-4.5 border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              High Flood Threat
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--level-danger)] animate-pulse shadow-xs" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--level-danger)] mt-1">
            {(counts.severe + counts.extreme).toLocaleString()}
          </div>
          <span className="text-[11px] text-[var(--level-warning)] mt-1 block font-medium">
            {counts.severe} Severe · {counts.extreme} Extreme
          </span>
        </div>
      </div>

      {/* ─── Multi-Facet Filter Bar (No Emojis, Exact Themed Tokens) ───────── */}
      <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">{t.typeAll}</option>
              <option value="river-level">River Level Gauge</option>
              <option value="reservoir-inflow">Reservoir Inflow</option>
            </select>
          </div>

          {/* Status Filter (No Emojis) */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">{t.statusAll}</option>
              <option value="Normal">{t.statusNormal}</option>
              <option value="Above normal">{t.statusAboveNormal}</option>
              <option value="Severe">{t.statusSevere}</option>
              <option value="Extreme">{t.statusExtreme}</option>
            </select>
          </div>

          {/* Basin Filter */}
          <div>
            <select
              value={selectedBasin}
              onChange={(e) => setSelectedBasin(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
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
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
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
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
            <span className="text-[var(--text-muted)]">
              Showing <span className="font-bold text-[var(--text)]">{filteredStations.length}</span> of {stations.length} stations
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-[var(--live)] hover:underline font-semibold cursor-pointer"
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
              <h2 className="font-bold text-sm sm:text-base text-[var(--text)]">
                Live National Hydrographic Map
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                ({filteredStations.length} stations displayed)
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--live)] animate-pulse" />
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
