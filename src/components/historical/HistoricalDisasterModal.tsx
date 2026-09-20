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
import { Landmark, Search, X, MapPin, Shield } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl text-[var(--text)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--primary)]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-[var(--text)] tracking-tight">
                  Historical disaster intelligence
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono border border-[var(--border)] bg-[var(--surface-2)] text-[var(--live)]">
                  Live connected
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Search a city to explore historical natural disaster records, flood telemetry & impact timeline.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Scrollable Container ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ─── Search Bar & Examples ──────────────────────────────────────── */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchQuery);
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city (e.g. Bengaluru, Mumbai, Chennai, Patna...)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shrink-0 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Search history</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggestions & Examples */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="text-[11px] font-medium uppercase tracking-wider mr-1">
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
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-semibold'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Recent Search History if different */}
            {searchHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs border-t border-[var(--border)] text-[var(--text-muted)]">
                <span className="text-[10px] uppercase tracking-wider font-medium">
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
                    className="px-2 py-0.5 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)] text-[11px] hover:text-[var(--text)] transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Loading State ──────────────────────────────────────────────── */}
          {isLoading && (
            <div className="p-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Querying historical disaster telemetry for "{searchQuery}"...
              </p>
              <span className="text-xs text-[var(--text-muted)]">
                Scanning precipitation records, hydrodynamic reports, and historical catalogs
              </span>
            </div>
          )}

          {/* ─── Error / Empty State ────────────────────────────────────────── */}
          {!isLoading && data && !data.found && (
            <div className="p-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-center space-y-3">
              <Search className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
              <h3 className="text-base font-semibold text-[var(--text)]">
                No historical disaster data found for "{data.query}"
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
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
                    className="px-3 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-medium"
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
              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
                      Location
                    </span>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Coordinates: {data.city} catchment
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[var(--text)] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[var(--primary)]" />
                    <span>{data.city}, {data.state || 'India'}</span>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Historical disaster events found: <strong className="text-[var(--text)] font-mono text-sm">{data.totalEvents}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-right">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-medium">
                      Archive status
                    </span>
                    <span className="text-xs font-mono text-[var(--live)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse"></span>
                      Verified telemetry
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
        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)] shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>FlowShield disaster archive</span>
            <span>•</span>
            <span className="text-[var(--text-muted)]">
              Verified hydrological situation intelligence
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--text)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            Close
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
