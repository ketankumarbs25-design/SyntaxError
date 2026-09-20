import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { getStations } from '../api/adapter';
import { formatIST } from '../api/status';
import { useI18n } from '../i18n';

type SortField =
  | 'name'
  | 'river'
  | 'basin'
  | 'state'
  | 'currentLevel'
  | 'warningLevel'
  | 'dangerLevel'
  | 'hfl'
  | 'status';
type SortOrder = 'asc' | 'desc';

export const StationsPage: React.FC = () => {
  const { language, t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBasin, setSelectedBasin] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [sortField, setSortField] = useState<SortField>('currentLevel');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: stations = [], isLoading } = useQuery({
    queryKey: ['stations'],
    queryFn: getStations,
    refetchInterval: 3 * 60 * 1000,
  });

  const basins = useMemo(() => {
    return Array.from(new Set(stations.map((s) => s.basin))).filter(Boolean).sort();
  }, [stations]);

  // Filtered stations
  const filtered = useMemo(() => {
    return stations.filter((s) => {
      if (selectedBasin !== 'all' && s.basin !== selectedBasin) return false;
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
      if (selectedType !== 'all' && s.type !== selectedType) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesHi = s.hindiName?.toLowerCase().includes(q);
        const matchesRiver = s.river.toLowerCase().includes(q);
        const matchesDistrict = s.district.toLowerCase().includes(q);
        const matchesState = s.state.toLowerCase().includes(q);
        return matchesName || matchesHi || matchesRiver || matchesDistrict || matchesState;
      }

      return true;
    });
  }, [stations, selectedBasin, selectedStatus, selectedType, searchQuery]);

  // Sorted stations
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      if (typeof aVal === 'number') {
        return sortOrder === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }

      return 0;
    });
    return list;
  }, [filtered, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginatedStations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Station ID',
      'Station Name',
      'Type',
      'River',
      'Basin',
      'State',
      'District',
      'Current Level (m)',
      'Warning Level (m)',
      'Danger Level (m)',
      'HFL (m)',
      'Delta to Danger (m)',
      'Status',
      'Trend',
      'Last Updated (IST)',
    ];

    const rows = sorted.map((s) => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.type}"`,
      `"${s.river}"`,
      `"${s.basin}"`,
      `"${s.state}"`,
      `"${s.district}"`,
      s.currentLevel.toFixed(2),
      s.warningLevel.toFixed(2),
      s.dangerLevel.toFixed(2),
      s.hfl.toFixed(2),
      s.deltaToDangerM.toFixed(2),
      `"${s.status}"`,
      `"${s.trend}"`,
      `"${formatIST(s.lastUpdated)}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `flowshield_india_stations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            {t.navStations}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Nationwide register of hydrological gauging stations and reservoir inflows
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-medium text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-[var(--live)]" />
          <span>{t.exportCSV}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--surface)] rounded-xl p-3 sm:p-4 border border-[var(--border)] shadow-xs flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <select
          value={selectedBasin}
          onChange={(e) => {
            setSelectedBasin(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
        >
          <option value="all">{t.allBasins}</option>
          {basins.map((b) => (
            <option key={b} value={b}>
              {b} Basin
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
        >
          <option value="all">{t.statusAll}</option>
          <option value="Normal">Normal</option>
          <option value="Above normal">Above normal</option>
          <option value="Severe">Severe</option>
          <option value="Extreme">Extreme</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
        >
          <option value="all">{t.typeAll}</option>
          <option value="river-level">River level gauge</option>
          <option value="reservoir-inflow">Reservoir inflow</option>
        </select>

        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedBasin('all');
            setSelectedStatus('all');
            setSelectedType('all');
            setCurrentPage(1);
          }}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
          title={t.resetFilters}
          aria-label="Reset filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Table with Sticky Header and Horizontal Scrolling */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar max-h-[680px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-[var(--surface-2)] border-b border-[var(--border)] text-[var(--text-muted)] font-medium select-none">
              <tr className="h-11">
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-4 cursor-pointer hover:text-[var(--text)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.stationName}</span>
                    {sortField === 'name' ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('river')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[var(--text)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.river}</span>
                    {sortField === 'river' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('basin')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[var(--text)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.basin}</span>
                    {sortField === 'basin' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('state')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[var(--text)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.state}</span>
                    {sortField === 'state' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentLevel')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[var(--text)] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{t.currentLevel}</span>
                    {sortField === 'currentLevel' &&
                      (sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ))}
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Stage gauge</th>
                <th className="py-2.5 px-3 text-center">{t.trend}</th>
                <th
                  onClick={() => handleSort('warningLevel')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-[var(--text)]"
                >
                  {t.warningLevel}
                </th>
                <th
                  onClick={() => handleSort('dangerLevel')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-[var(--text)]"
                >
                  {t.dangerLevel}
                </th>
                <th
                  onClick={() => handleSort('hfl')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-[var(--text)]"
                >
                  {t.hfl}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:text-[var(--text)]"
                >
                  {t.status}
                </th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)] font-sans">
              {isLoading ? (
                // Skeleton loaders
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="h-14 animate-pulse">
                    <td className="py-3 px-4">
                      <div className="h-3.5 bg-[var(--surface-2)] rounded-md w-32 mb-1.5" />
                      <div className="h-2.5 bg-[var(--surface-2)] rounded-md w-20" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-16" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-20" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-16" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-14 ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="h-2 bg-[var(--surface-2)] rounded-full w-20 mx-auto" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-12 mx-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-12 ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-12 ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-3 bg-[var(--surface-2)] rounded-md w-12 ml-auto" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="h-5 bg-[var(--surface-2)] rounded-full w-16 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="h-7 w-7 bg-[var(--surface-2)] rounded-lg mx-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedStations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-xs text-[var(--text-muted)]">
                    No stations found matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedStations.map((stn, idx) => {
                  const displayName =
                    language === 'hi' && stn.hindiName ? stn.hindiName : stn.name;

                  // Severity color
                  const statusColor =
                    stn.status === 'Extreme'
                      ? 'var(--danger)'
                      : stn.status === 'Severe'
                      ? 'var(--warning)'
                      : stn.status === 'Above normal'
                      ? 'var(--watch)'
                      : 'var(--normal)';

                  // Inline gauge percentage relative to HFL or Danger level
                  const maxBenchmark = Math.max(stn.hfl, stn.dangerLevel, stn.currentLevel, 1);
                  const levelPct = Math.min(
                    Math.max((stn.currentLevel / maxBenchmark) * 100, 4),
                    100
                  );

                  return (
                    <tr
                      key={stn.id}
                      className={`h-14 transition-colors ${
                        idx % 2 === 0 ? 'bg-transparent' : 'bg-[var(--surface-2)]/25'
                      } hover:bg-[var(--surface-2)]/60`}
                    >
                      {/* Name truncated with tooltip */}
                      <td className="py-2.5 px-4">
                        <div
                          className="font-semibold text-xs text-[var(--text)] truncate max-w-[180px] sm:max-w-[220px]"
                          title={displayName}
                        >
                          {displayName}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {stn.code} •{' '}
                          {stn.type === 'reservoir-inflow' ? 'Reservoir' : 'River gauge'}
                        </div>
                      </td>

                      {/* River */}
                      <td className="py-2.5 px-3 font-medium text-[var(--text)] whitespace-nowrap">
                        {stn.river}
                      </td>

                      {/* Basin */}
                      <td className="py-2.5 px-3 text-[var(--text-muted)] whitespace-nowrap">
                        {stn.basin}
                      </td>

                      {/* State */}
                      <td className="py-2.5 px-3 text-[var(--text-muted)] whitespace-nowrap">
                        {stn.state}
                      </td>

                      {/* Current Level (Neutral Font) */}
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-xs text-[var(--text)] tabular-nums whitespace-nowrap">
                        {stn.currentLevel.toFixed(2)} m
                      </td>

                      {/* Inline Bar: Current level vs threshold */}
                      <td className="py-2.5 px-3 text-center">
                        <div
                          className="w-20 sm:w-24 h-2 rounded-full bg-[var(--surface-2)] mx-auto overflow-hidden relative"
                          title={`Level: ${stn.currentLevel.toFixed(2)}m (${levelPct.toFixed(0)}% of peak benchmark)`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${levelPct}%`,
                              backgroundColor: statusColor,
                            }}
                          />
                        </div>
                      </td>

                      {/* Trend */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {stn.trend === 'Rising' ? (
                          <span className="inline-flex items-center gap-1 text-[var(--danger)] font-medium text-[11px]">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Rising</span>
                          </span>
                        ) : stn.trend === 'Falling' ? (
                          <span className="inline-flex items-center gap-1 text-[var(--normal)] font-medium text-[11px]">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>Falling</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[var(--text-muted)] font-normal text-[11px]">
                            <Minus className="w-3.5 h-3.5" />
                            <span>Steady</span>
                          </span>
                        )}
                      </td>

                      {/* Warning Level (Neutral) */}
                      <td className="py-2.5 px-3 text-right text-[var(--text-muted)] font-mono tabular-nums whitespace-nowrap">
                        {stn.warningLevel.toFixed(2)} m
                      </td>

                      {/* Danger Level (Neutral - not red on every row!) */}
                      <td className="py-2.5 px-3 text-right text-[var(--text-muted)] font-mono tabular-nums whitespace-nowrap">
                        {stn.dangerLevel.toFixed(2)} m
                      </td>

                      {/* HFL (Neutral - not red on every row!) */}
                      <td className="py-2.5 px-3 text-right text-[var(--text-muted)] font-mono tabular-nums whitespace-nowrap">
                        {stn.hfl.toFixed(2)} m
                      </td>

                      {/* Status Pill (Single Line, Never Wraps) */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap inline-block"
                          style={{
                            backgroundColor: statusColor,
                            color: stn.status === 'Above normal' ? '#0B1F33' : '#FFFFFF',
                          }}
                        >
                          {stn.status}
                        </span>
                      </td>

                      {/* Action: Single-Line Icon Button */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <NavLink
                          to={`/stations/${stn.id}`}
                          className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                          title="View station details"
                          aria-label={`View details for ${displayName}`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </NavLink>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-[var(--surface-2)]/50 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>
              {t.showingPage}{' '}
              <span className="font-semibold text-[var(--text)] font-mono tabular-nums">
                {currentPage}
              </span>{' '}
              {t.of}{' '}
              <span className="font-semibold text-[var(--text)] font-mono tabular-nums">
                {totalPages}
              </span>{' '}
              ({sorted.length} total)
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-[var(--border)] pl-3">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-lg px-2 py-0.5 text-xs font-mono tabular-nums cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--surface-2)] text-[var(--text)] cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--surface-2)] text-[var(--text)] cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationsPage;
