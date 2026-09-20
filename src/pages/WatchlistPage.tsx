import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellRing,
  Trash2,
  ExternalLink,
  Plus,
  Radio,
  Search,
  BookmarkPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CWC_NATIONAL_STATIONS } from '../api/cwcNetwork';

export const WatchlistPage: React.FC = () => {
  const { watchlist, toggleWatchlist } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const handleFocusAdd = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto pb-12">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Personal station watchlist
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--live)] border border-[var(--border)]">
              {watchedStations.length} saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Real-time stage and reservoir inflow monitoring for your pinned gauging stations
          </p>
        </div>

        <button
          onClick={handleFocusAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:brightness-110 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add station</span>
        </button>
      </div>

      {/* Threshold Alert Notification Preferences Card */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--live)] shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
              Threshold alert notifications
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Receive automatic push advisories when any watched station crosses warning or danger mark
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={smsAlertsEnabled}
              onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
              className="rounded accent-[var(--primary)]"
            />
            <span className="text-[var(--text)]">SMS alerts</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={emailAlertsEnabled}
              onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
              className="rounded accent-[var(--primary)]"
            />
            <span className="text-[var(--text)]">Email alerts</span>
          </label>
        </div>
      </div>

      {/* Add New Station Search Box */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[var(--live)]" />
            <span>Search & pin station</span>
          </h3>
        </div>

        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by station name, river (e.g. Ganga, Brahmaputra), or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {searchResults.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-[var(--text)] truncate">{st.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    {st.river} • {st.state}
                  </p>
                </div>
                <button
                  onClick={() => {
                    toggleWatchlist(st.id ?? '');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1 rounded-md bg-[var(--primary)] hover:brightness-110 text-white text-[11px] font-medium shrink-0 cursor-pointer shadow-xs"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watched Stations Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[var(--live)] animate-pulse" />
            <span>Active watched stations</span>
          </h2>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">Live telemetry</span>
        </div>

        {watchedStations.length === 0 ? (
          /* Friendly Illustrated Empty State with 1 Clear Action */
          <div className="text-center py-12 px-4 bg-[var(--surface)] rounded-xl border border-dashed border-[var(--border)] max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <BookmarkPlus className="w-7 h-7 text-[var(--live)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">
              Your watchlist is empty
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed max-w-xs mx-auto">
              Keep a close watch on flood-prone rivers and reservoirs near you by pinning stations to your watchlist.
            </p>
            <button
              onClick={handleFocusAdd}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:brightness-110 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add station</span>
            </button>
          </div>
        ) : (
          /* Animated Add/Remove Grid */
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {watchedStations.map((st) => {
                const curLevel = Number(st.current_level ?? 0);
                const dgrLevel = Number(st.danger_level ?? 0);
                const wrnLevel = Number(st.warning_level ?? 0);
                const isSevere = curLevel >= dgrLevel;
                const isWarning = curLevel >= wrnLevel && !isSevere;

                const statusColor = isSevere
                  ? 'var(--danger)'
                  : isWarning
                  ? 'var(--warning)'
                  : 'var(--normal)';

                return (
                  <motion.div
                    key={st.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xs hover:border-[var(--live)]/50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono text-[var(--live)]">
                            {st.id}
                          </span>
                          <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
                            {st.name}
                          </h3>
                        </div>

                        <button
                          onClick={() => toggleWatchlist(st.id ?? '')}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                          title="Remove from watchlist"
                          aria-label={`Remove ${st.name} from watchlist`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        River {st.river} • {st.basin} basin • {st.state}
                      </p>

                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs mb-3">
                        <div>
                          <p className="text-[11px] text-[var(--text-muted)]">Current level</p>
                          <p className="text-sm font-mono font-medium text-[var(--text)] tabular-nums">
                            {curLevel.toFixed(2)} m
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-[var(--text-muted)]">Danger level</p>
                          <p className="text-sm font-mono font-medium text-[var(--text-muted)] tabular-nums">
                            {dgrLevel.toFixed(2)} m
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-[var(--text-muted)]">Warning level</p>
                          <p className="text-xs font-mono font-medium text-[var(--text-muted)] tabular-nums">
                            {wrnLevel.toFixed(2)} m
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-[var(--text-muted)]">Status</p>
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-medium text-white"
                            style={{ backgroundColor: statusColor }}
                          >
                            {isSevere ? 'Severe flood' : isWarning ? 'Warning' : 'Normal'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/stations/${st.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--primary)] hover:text-white text-[var(--text)] text-xs font-medium transition-colors border border-[var(--border)]"
                    >
                      <span>View telemetry & hydrograph</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
