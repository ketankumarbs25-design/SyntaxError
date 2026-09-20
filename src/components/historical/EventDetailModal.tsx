import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { HistoricalDisasterEvent, DisasterSeverity } from '../../types/disaster';
import { getDisasterLucideIcon } from './disasterIcons';

interface EventDetailModalProps {
  event: HistoricalDisasterEvent | null;
  onClose: () => void;
}

const SEVERITY_BADGES: Record<
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
    label: 'Severe / critical',
    text: 'text-[var(--danger)]',
    bg: 'bg-[var(--danger)]/15',
    border: 'border-[var(--danger)]/30',
  },
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const severityStyle = SEVERITY_BADGES[event.severity] || SEVERITY_BADGES.Moderate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl text-[var(--text)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--primary)] shrink-0">
              {getDisasterLucideIcon(event.disasterType, { className: 'w-5 h-5' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  {event.disasterType}
                </span>
                <span className="text-[var(--text-muted)]">•</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${severityStyle.bg} ${severityStyle.border} ${severityStyle.text}`}
                >
                  Severity: {severityStyle.label}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--text)] mt-0.5">
                {event.headline || `${event.city} ${event.disasterType} event`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)] text-sm">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Location */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[var(--primary)]" />
                Location
              </span>
              <span className="text-[var(--text)] font-medium mt-1 block text-xs">
                {event.city ? `${event.city}, ${event.state || 'Data unavailable'}` : 'Data unavailable'}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">{event.country || 'India'}</span>
            </div>

            {/* Date */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[var(--primary)]" />
                Date
              </span>
              <span className="text-[var(--text)] font-medium mt-1 block text-xs font-mono">
                {event.date || 'Data unavailable'}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">Year: {event.year || 'Data unavailable'}</span>
            </div>

            {/* Duration */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
              <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--primary)]" />
                Duration
              </span>
              <span className="text-[var(--text)] font-medium mt-1 block text-xs">
                {event.duration || 'Data unavailable'}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                End: {event.endDate || 'Data unavailable'}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
            <h4 className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Disaster description</span>
            </h4>
            <p className="text-[var(--text-muted)] leading-relaxed text-xs sm:text-sm">
              {event.description || 'Data unavailable'}
            </p>
          </div>

          {/* Impact Information */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2.5">
            <h4 className="text-xs font-semibold text-[var(--warning)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Impact & damage telemetry</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[11px]">Affected population:</span>
                <span className="text-[var(--text)] font-medium mt-0.5 block font-mono">
                  {event.impact?.affectedPopulation || 'Data unavailable'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] block text-[11px]">Casualties:</span>
                <span className="text-[var(--danger)] font-medium mt-0.5 block font-mono">
                  {event.impact?.casualties || 'Data unavailable'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] sm:col-span-2">
                <span className="text-[var(--text-muted)] block text-[11px]">Damage estimate:</span>
                <span className="text-[var(--warning)] font-medium mt-0.5 block font-mono">
                  {event.impact?.damageEstimate || 'Data unavailable'}
                </span>
              </div>

              {event.impact?.areasAffected && event.impact.areasAffected.length > 0 && (
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] sm:col-span-2">
                  <span className="text-[var(--text-muted)] block text-[11px] mb-1.5">Areas affected:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {event.impact.areasAffected.map((area, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-[11px]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source / Reference Citation */}
          <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase tracking-wider font-medium">
                Official reference & source
              </span>
              <span className="text-[var(--text)] font-medium">
                {event.source || 'Data unavailable'}
              </span>
            </div>

            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface)]/80 text-[var(--primary)] border border-[var(--border)] text-[11px] font-medium inline-flex items-center gap-1 transition-colors shrink-0"
              >
                <span>View source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)]"></span>
            <span>FlowShield disaster intelligence archive</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-2)]/80 text-[var(--text)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
