/**
 * FLOWSHIELD — Historical Event Detail Modal
 *
 * Provides a comprehensive, granular inspection view for a historical disaster event.
 * Adheres strictly to the rule:
 * "Do NOT invent information. If a field is unavailable, display: 'Data unavailable'."
 */

import React, { useEffect } from 'react';
import type { HistoricalDisasterEvent, DisasterSeverity } from '../../types/disaster';
import { DISASTER_TYPE_METADATA } from '../../data/mockDisasters';

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
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  Moderate: {
    label: 'Moderate',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  High: {
    label: 'High',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  Severe: {
    label: 'Severe / Critical',
    text: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
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

  const typeMeta = DISASTER_TYPE_METADATA[event.disasterType] || {
    label: event.disasterType,
    icon: '⚠️',
  };
  const severityStyle = SEVERITY_BADGES[event.severity] || SEVERITY_BADGES.Moderate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl shadow-cyan-950/40 text-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700 text-2xl shadow-inner">
              {typeMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  {event.disasterType}
                </span>
                <span className="text-slate-600">•</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${severityStyle.bg} ${severityStyle.border} ${severityStyle.text}`}
                >
                  Severity: {severityStyle.label}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {event.headline || `${event.city} ${event.disasterType} Event`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)] text-sm">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Location */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                📍 Location
              </span>
              <span className="text-white font-medium mt-1 block">
                {event.city ? `${event.city}, ${event.state || 'Data unavailable'}` : 'Data unavailable'}
              </span>
              <span className="text-[11px] text-slate-500">{event.country || 'India'}</span>
            </div>

            {/* Date */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                📅 Date
              </span>
              <span className="text-white font-medium mt-1 block">
                {event.date || 'Data unavailable'}
              </span>
              <span className="text-[11px] text-slate-500">Year: {event.year || 'Data unavailable'}</span>
            </div>

            {/* Duration */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                ⏱ Duration
              </span>
              <span className="text-white font-medium mt-1 block">
                {event.duration || 'Data unavailable'}
              </span>
              <span className="text-[11px] text-slate-500">
                End: {event.endDate || 'Data unavailable'}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5">
            <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>📋</span>
              <span>Disaster Description</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              {event.description || 'Data unavailable'}
            </p>
          </div>

          {/* Impact Information */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
            <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Impact & Damage Telemetry</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Affected Population:</span>
                <span className="text-slate-200 font-medium mt-0.5 block">
                  {event.impact?.affectedPopulation || 'Data unavailable'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                <span className="text-slate-400 block text-[11px]">Casualties:</span>
                <span className="text-rose-300 font-medium mt-0.5 block">
                  {event.impact?.casualties || 'Data unavailable'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60 sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Damage Estimate:</span>
                <span className="text-amber-200 font-medium mt-0.5 block">
                  {event.impact?.damageEstimate || 'Data unavailable'}
                </span>
              </div>

              {event.impact?.areasAffected && event.impact.areasAffected.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px] mb-1.5">Areas Affected:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {event.impact.areasAffected.map((area, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px]"
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
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">
                Official Reference & Source
              </span>
              <span className="text-slate-300 font-medium">
                {event.source || 'Data unavailable'}
              </span>
            </div>

            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium inline-flex items-center gap-1 transition-colors shrink-0"
              >
                <span>View Source</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>FlowShield Disaster Intelligence Archive</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
