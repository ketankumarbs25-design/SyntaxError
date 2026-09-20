import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  BellRing,
  Trash2,
  ExternalLink,
  Plus,
  Radio,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CWC_NATIONAL_STATIONS } from '../api/cwcNetwork';

export const WatchlistPage: React.FC = () => {
  const { watchlist, toggleWatchlist } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);

  // Filter watchlist stations
  const watchedStations = CWC_NATIONAL_STATIONS.filter((s) => s.id && watchlist.includes(s.id));

  // Search stations to add
  const searchResults = searchQuery.trim()
    ? CWC_NATIONAL_STATIONS.filter(
        (s) =>
          !watchlist.includes(s.id ?? '') &&
          (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.river ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.state ?? '').toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1440px] mx-auto pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            Personal Station Watchlist & Alert Trigger Desk
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Priority Station Telemetry Monitoring
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Monitor real-time water levels, discharge telemetry, and danger thresholds for your starred CWC stations across India.
          </p>
        </div>
      </div>

      {/* Alert Notification Preferences Card */}
      <div className="bg-white dark:bg-[#0E101B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant Threshold Alert Notification Triggers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive automated push triggers when any watched station crosses Warning or Danger Mark
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={smsAlertsEnabled}
              onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700 dark:text-slate-300">SMS Alerts</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emailAlertsEnabled}
              onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700 dark:text-slate-300">Email Alerts</span>
          </label>
        </div>
      </div>

      {/* Add New Station Search Box */}
      <div className="bg-white dark:bg-[#0E101B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-500" />
          Add Station to Watchlist (from 1,500 CWC Network)
        </h3>

        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by station name, river (e.g. Ganga, Brahmaputra), or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {searchResults.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{st.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{st.river} • {st.state}</p>
                </div>
                <button
                  onClick={() => {
                    toggleWatchlist(st.id ?? '');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 cursor-pointer shadow-xs"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watched Stations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            Active Watched Stations ({watchedStations.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live Telemetry Linked</span>
        </div>

        {watchedStations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0E101B] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Watchlist is Empty</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Search and add CWC stations above, or click the star button on any station detail page to pin it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {watchedStations.map((st) => {
              const curLevel = Number(st.current_level ?? 0);
              const dgrLevel = Number(st.danger_level ?? 0);
              const wrnLevel = Number(st.warning_level ?? 0);
              const isSevere = curLevel >= dgrLevel;
              const isWarning = curLevel >= wrnLevel && !isSevere;

              return (
                <div
                  key={st.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0E101B] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                          {st.id}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {st.name}
                        </h3>
                      </div>

                      <button
                        onClick={() => toggleWatchlist(st.id ?? '')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {st.river} River • {st.basin} Basin • {st.state}
                    </p>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs mb-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Current Level</p>
                        <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                          {curLevel.toFixed(2)} m
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Danger Level</p>
                        <p className="text-lg font-mono font-extrabold text-red-600 dark:text-red-400">
                          {dgrLevel.toFixed(2)} m
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Warning Level</p>
                        <p className="text-xs font-mono font-bold text-amber-500">
                          {wrnLevel.toFixed(2)} m
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Status</p>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isSevere
                              ? 'bg-red-500/10 text-red-500'
                              : isWarning
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-emerald-500/10 text-emerald-500'
                          }`}
                        >
                          {isSevere ? 'Severe Flood' : isWarning ? 'Warning' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/stations/${st.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    View Telemetry & Hydrograph
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
