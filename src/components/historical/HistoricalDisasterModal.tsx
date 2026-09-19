/**
 * FLOWSHIELD — Historical Disaster Intelligence Main Module
 *
 * Dedicated modal and view providing:
 * - City search with debounce / autocomplete chips & search history
 * - Clear location banner & telemetry counter
 * - Dynamic Disaster Summary (only active categories with >0 events)
 * - Chronological event timeline with interactive event cards
 * - Detailed event inspection modal
 * - Loading, empty, and error states
 * - Transparent labeling of curated mock data archive vs live API
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  DisasterType,
  HistoricalDisasterEvent,
  HistoricalDisasterResponse,
} from '../../types/disaster';
import {
  DisasterService,
  SUGGESTED_CITIES,
} from '../../services/disasterService';
import { DisasterSummary } from './DisasterSummary';
import { DisasterTimeline } from './DisasterTimeline';
import { EventDetailModal } from './EventDetailModal';

interface HistoricalDisasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCity?: string | null;
}

export const HistoricalDisasterModal: React.FC<HistoricalDisasterModalProps> = ({
  isOpen,
  onClose,
  initialCity,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialCity || 'Bengaluru');
  const [data, setData] = useState<HistoricalDisasterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DisasterType | 'ALL'>('ALL');
  const [inspectedEvent, setInspectedEvent] = useState<HistoricalDisasterEvent | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('flowshield_disaster_history');
      return saved ? JSON.parse(saved) : ['Bengaluru', 'Mumbai', 'Chennai', 'Patna', 'Guwahati', 'Kochi'];
    } catch {
      return ['Bengaluru', 'Mumbai', 'Chennai', 'Patna', 'Guwahati', 'Kochi'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Perform city disaster search
  const handleSearch = useCallback(
    async (cityToSearch: string) => {
      const trimmed = cityToSearch.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setSelectedCategory('ALL');

      try {
        const response = await DisasterService.getHistoricalDisasters(trimmed);
        setData(response);

        // Update search history if found
        if (response.found && response.city) {
          setSearchHistory((prev) => {
            const filtered = prev.filter(
              (item) => item.toLowerCase() !== response.city!.toLowerCase()
            );
            const updated = [response.city!, ...filtered].slice(0, 8);
            try {
              sessionStorage.setItem('flowshield_disaster_history', JSON.stringify(updated));
            } catch {
              // ignore storage errors
            }
            return updated;
          });
        }
      } catch (err: any) {
        setData({
          query: trimmed,
          found: false,
          city: null,
          state: null,
          country: null,
          totalEvents: 0,
          categories: [],
          events: [],
          sourceMode: 'curated_mock',
          errorMessage: err?.message || 'Failed to fetch disaster telemetry.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      const target = initialCity?.trim() || searchQuery || 'Bengaluru';
      handleSearch(target);
    }
  }, [isOpen, initialCity, handleSearch]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectedEvent) {
          setInspectedEvent(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inspectedEvent, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-[#080d1a]/95 border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 text-xl shadow-lg shadow-cyan-500/20">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Historical Disaster Intelligence
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                  {data?.sourceMode === 'live_api' ? '⚡ LIVE API MODE' : '📦 CURATED ARCHIVE (MOCK)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Search a city to explore its historical natural disaster records, flood telemetry & impact timeline.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ─── Scrollable Container ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ─── Search Bar & Examples ──────────────────────────────────────── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 shadow-inner">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchQuery);
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔍
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city (e.g. Bengaluru, Mumbai, Chennai, Patna...)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold tracking-wider uppercase shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>SEARCH HISTORY</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggestions & Examples */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                Examples:
              </span>
              {SUGGESTED_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSearchQuery(city);
                    handleSearch(city);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                    data?.city?.toLowerCase() === city.toLowerCase()
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Recent Search History if different */}
            {searchHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs border-t border-slate-800/50 text-slate-500">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Recent:
                </span>
                {searchHistory.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item);
                      handleSearch(item);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-900/40 hover:bg-slate-800 border border-slate-800/60 text-slate-400 text-[11px] hover:text-cyan-300 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Loading State ──────────────────────────────────────────────── */}
          {isLoading && (
            <div className="p-12 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-cyan-300">
                Querying historical disaster telemetry for "{searchQuery}"...
              </p>
              <span className="text-xs text-slate-500">
                Scanning precipitation records, hydrodynamic reports, and historical catalogs
              </span>
            </div>
          )}

          {/* ─── Error / Empty State ────────────────────────────────────────── */}
          {!isLoading && data && !data.found && (
            <div className="p-10 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center space-y-3">
              <span className="text-4xl block">🔍</span>
              <h3 className="text-base font-bold text-white">
                No historical disaster data found for "{data.query}"
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                The current archive contains detailed historical records for major Indian cities.
                Try exploring one of the suggested cities above:
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {SUGGESTED_CITIES.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSearchQuery(c);
                      handleSearch(c);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium"
                  >
                    Explore {c} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Results View ───────────────────────────────────────────────── */}
          {!isLoading && data && data.found && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Location Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan-950/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      LOCATION
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">
                      Coordinates: {data.city} Catchment
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <span>📍</span>
                    <span>{data.city}, {data.state || 'India'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Historical disaster events found: <strong className="text-cyan-300 font-mono text-sm">{data.totalEvents}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Archive Status
                    </span>
                    <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      Verified Telemetry
                    </span>
                  </div>
                </div>
              </div>

              {/* Disaster Category Summary */}
              <DisasterSummary
                categories={data.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                totalEvents={data.totalEvents}
              />

              {/* Historical Timeline */}
              <DisasterTimeline
                events={data.events}
                selectedCategory={selectedCategory}
                onViewDetails={(ev) => setInspectedEvent(ev)}
              />
            </div>
          )}
        </div>

        {/* ─── Footer Status ────────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span>🛡️ FlowShield Disaster Archive</span>
            <span>•</span>
            <span className="text-slate-400">
              {data?.sourceMode === 'live_api'
                ? 'Connected to live external disaster intelligence service'
                : 'Curated offline archive (API-ready for live connection)'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Back to Simulation
          </button>
        </div>
      </div>

      {/* ─── Granular Event Details Modal ───────────────────────────────────── */}
      <EventDetailModal
        event={inspectedEvent}
        onClose={() => setInspectedEvent(null)}
      />
    </div>
  );
};
