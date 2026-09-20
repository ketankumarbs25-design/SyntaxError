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
  Loader2,
} from 'lucide-react';
import { getStations } from '../api/adapter';
import { formatIST } from '../api/status';
import { useI18n } from '../i18n';

type SortField = 'name' | 'river' | 'basin' | 'state' | 'currentLevel' | 'warningLevel' | 'dangerLevel' | 'hfl' | 'status';
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flowshield_india_stations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading stations directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.navStations}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sortable nationwide register of hydrological gauging stations and reservoir inflows.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{t.exportCSV}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <select
          value={selectedBasin}
          onChange={(e) => {
            setSelectedBasin(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
        >
          <option value="all">{t.allBasins}</option>
          {basins.map((b) => (
            <option key={b} value={b}>{b} Basin</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
        >
          <option value="all">{t.statusAll}</option>
          <option value="Normal">Normal</option>
          <option value="Above normal">Above Normal</option>
          <option value="Severe">Severe</option>
          <option value="Extreme">Extreme</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
        >
          <option value="all">{t.typeAll}</option>
          <option value="river-level">River Level (Circles)</option>
          <option value="reservoir-inflow">Reservoir Inflow (Squares)</option>
        </select>

        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedBasin('all');
            setSelectedStatus('all');
            setSelectedType('all');
            setCurrentPage(1);
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          title={t.resetFilters}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Sortable Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.stationName}</span>
                    {sortField === 'name' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('river')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.river}</span>
                    {sortField === 'river' && (sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('basin')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.basin}</span>
                    {sortField === 'basin' && (sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('state')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{t.state}</span>
                    {sortField === 'state' && (sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('currentLevel')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{t.currentLevel}</span>
                    {sortField === 'currentLevel' && (sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">{t.trend}</th>
                <th
                  onClick={() => handleSort('warningLevel')}
                  className="py-3 px-3 text-right cursor-pointer"
                >
                  {t.warningLevel}
                </th>
                <th
                  onClick={() => handleSort('dangerLevel')}
                  className="py-3 px-3 text-right cursor-pointer"
                >
                  {t.dangerLevel}
                </th>
                <th
                  onClick={() => handleSort('hfl')}
                  className="py-3 px-3 text-right cursor-pointer"
                >
                  {t.hfl}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 text-center cursor-pointer"
                >
                  {t.status}
                </th>
                <th className="py-3 px-4 text-center">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {paginatedStations.map((stn) => {
                let badgeClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200';
                if (stn.status === 'Above normal') badgeClass = 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border-yellow-200';
                else if (stn.status === 'Severe') badgeClass = 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200';
                else if (stn.status === 'Extreme') badgeClass = 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200';

                return (
                  <tr key={stn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {language === 'hi' && stn.hindiName ? stn.hindiName : stn.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {stn.code} • {stn.type === 'reservoir-inflow' ? 'Reservoir Inflow' : 'River Level'}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {stn.river}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {stn.basin}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {stn.state}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white text-sm">
                      {stn.currentLevel.toFixed(2)} m
                    </td>
                    <td className="py-3 px-3 text-center">
                      {stn.trend === 'Rising' ? (
                        <span className="inline-flex items-center gap-0.5 text-red-600 font-semibold text-[11px]">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Rising
                        </span>
                      ) : stn.trend === 'Falling' ? (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold text-[11px]">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Falling
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-slate-400 font-medium text-[11px]">
                          <Minus className="w-3.5 h-3.5" />
                          Steady
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400 font-mono">
                      {stn.warningLevel.toFixed(2)} m
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-orange-600 font-mono">
                      {stn.dangerLevel.toFixed(2)} m
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-red-600 font-mono">
                      {stn.hfl.toFixed(2)} m
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {stn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <NavLink
                        to={`/stations/${stn.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <span>{t.viewDetails}</span>
                        <ArrowRight className="w-3 h-3" />
                      </NavLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              {t.showingPage} <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> {t.of} <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({sorted.length} total)
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 dark:border-slate-700 pl-3">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
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
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
