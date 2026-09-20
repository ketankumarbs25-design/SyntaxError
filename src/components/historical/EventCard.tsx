/**
 * FLOWSHIELD — Historical Event Card
 *
 * Renders individual disaster events with:
 * - Disaster icon and type
 * - Date / year
 * - Location
 * - Severity tag
 * - Short description
 * - Source reference
 * - [VIEW DETAILS] button to trigger expanded inspection modal
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { HistoricalDisasterEvent, DisasterSeverity } from '../../types/disaster';
import { getDisasterLucideIcon } from './disasterIcons';

interface EventCardProps {
  event: HistoricalDisasterEvent;
  onViewDetails: (event: HistoricalDisasterEvent) => void;
}

const SEVERITY_CONFIG: Record<
  DisasterSeverity,
  { label: string; text: string; bg: string; border: string }
> = {
  Low: {
    label: 'Low',
    text: 'text-[var(--normal)]',
    bg: 'bg-[var(--normal)]/15',
    border: 'border-[var(--normal)]/30',
  },
  Moderate: {
    label: 'Moderate',
    text: 'text-[var(--watch)]',
    bg: 'bg-[var(--watch)]/15',
    border: 'border-[var(--watch)]/30',
  },
  High: {
    label: 'High',
    text: 'text-[var(--warning)]',
    bg: 'bg-[var(--warning)]/15',
    border: 'border-[var(--warning)]/30',
  },
  Severe: {
    label: 'Severe',
    text: 'text-[var(--danger)]',
    bg: 'bg-[var(--danger)]/15',
    border: 'border-[var(--danger)]/30',
  },
};

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const severityStyle = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.Moderate;

  return (
    <div
      className="group relative rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-5 transition-all hover:border-[var(--primary)]/40 shadow-xs"
    >
      {/* Top Header: Icon, Type, Severity */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--primary)] shrink-0">
            {getDisasterLucideIcon(event.disasterType, { className: 'w-4 h-4' })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text)]">
                {event.disasterType}
              </span>
              <span className="text-[var(--text-muted)] text-xs">•</span>
              <span className="text-xs text-[var(--text-muted)]">
                {event.city}, {event.state}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              {event.date}
            </span>
          </div>
        </div>

        {/* Severity Badge */}
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${severityStyle.bg} ${severityStyle.border} ${severityStyle.text}`}
        >
          {severityStyle.label}
        </span>
      </div>

      {/* Headline if available */}
      {event.headline && (
        <h4 className="text-sm font-semibold text-[var(--text)] mb-1.5 line-clamp-1 group-hover:text-[var(--live)] transition-colors">
          {event.headline}
        </h4>
      )}

      {/* Short Description */}
      <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3 mb-3.5">
        {event.description}
      </p>

      {/* Footer: Source and Action Button */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border)] text-xs">
        <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">
          {event.source}
        </span>

        <button
          onClick={() => onViewDetails(event)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline cursor-pointer"
        >
          <span>View details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
