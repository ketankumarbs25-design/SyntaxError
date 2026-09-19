/**
 * FLOWSHIELD — Historical Disaster Timeline Component
 *
 * Renders chronological groupings of disaster events by year with
 * responsive timeline connectors and individual event cards.
 */

import React, { useMemo } from 'react';
import type { HistoricalDisasterEvent, DisasterType } from '../../types/disaster';
import { EventCard } from './EventCard';

interface DisasterTimelineProps {
  events: HistoricalDisasterEvent[];
  selectedCategory: DisasterType | 'ALL';
  onViewDetails: (event: HistoricalDisasterEvent) => void;
}

export const DisasterTimeline: React.FC<DisasterTimelineProps> = ({
  events,
  selectedCategory,
  onViewDetails,
}) => {
  // Filter events by active category selection if not ALL
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'ALL') return events;
    return events.filter((e) => e.disasterType === selectedCategory);
  }, [events, selectedCategory]);

  // Group events by Year descending
  const groupedByYear = useMemo(() => {
    const groups = new Map<number, HistoricalDisasterEvent[]>();
    for (const ev of filteredEvents) {
      const year = ev.year;
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(ev);
    }
    // Return array sorted by year descending
    return Array.from(groups.entries()).sort(([yearA], [yearB]) => yearB - yearA);
  }, [filteredEvents]);

  if (filteredEvents.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
        <span className="text-3xl block">🔍</span>
        <h4 className="text-sm font-semibold text-slate-300">
          No events found for category: {selectedCategory}
        </h4>
        <p className="text-xs text-slate-500">
          Try selecting "All Events" or a different disaster category above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <span>⏳</span>
          <span>Historical Timeline</span>
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/60 before:via-blue-500/40 before:to-transparent">
        {groupedByYear.map(([year, yearEvents]) => (
          <div key={year} className="relative space-y-3">
            {/* Year Node Marker on the timeline */}
            <div className="absolute -left-6 sm:-left-8 top-0 flex items-center gap-2">
              <div className="w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
              </div>
            </div>

            {/* Year Header Label */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-base sm:text-lg font-mono font-bold text-white tracking-wide">
                {year}
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({yearEvents.length} event{yearEvents.length !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Event Cards for this Year */}
            <div className="grid grid-cols-1 gap-3.5">
              {yearEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
