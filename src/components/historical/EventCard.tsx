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
import type { HistoricalDisasterEvent, DisasterSeverity } from '../../types/disaster';
import { DISASTER_TYPE_METADATA } from '../../data/mockDisasters';

interface EventCardProps {
  event: HistoricalDisasterEvent;
  onViewDetails: (event: HistoricalDisasterEvent) => void;
}

const SEVERITY_CONFIG: Record<
  DisasterSeverity,
  { label: string; text: string; bg: string; border: string; glow: string }
> = {
  Low: {
    label: 'LOW',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'group-hover:border-emerald-500/50',
  },
  Moderate: {
    label: 'MODERATE',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'group-hover:border-amber-500/50',
  },
  High: {
    label: 'HIGH',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    glow: 'group-hover:border-orange-500/50',
  },
  Severe: {
    label: 'SEVERE',
    text: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/40',
    glow: 'group-hover:border-rose-500/60',
  },
};

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const typeMeta = DISASTER_TYPE_METADATA[event.disasterType] || {
    label: event.disasterType,
    icon: '⚠️',
  };
  const severityStyle = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.Moderate;

  return (
    <div
      className={`group relative rounded-2xl bg-slate-900/80 border border-slate-800/90 p-4 sm:p-5 transition-all duration-300 hover:bg-slate-900/95 hover:shadow-xl hover:shadow-cyan-950/20 ${severityStyle.glow}`}
    >
      {/* Top Header: Icon, Type, Severity */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xl shadow-inner group-hover:scale-105 transition-transform">
            {typeMeta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                {event.disasterType}
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-300">
                {event.city}, {event.state}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {event.date}
            </span>
          </div>
        </div>

        {/* Severity Badge */}
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider border ${severityStyle.bg} ${severityStyle.border} ${severityStyle.text}`}
        >
          SEVERITY: {severityStyle.label}
        </span>
      </div>

      {/* Headline if available */}
      {event.headline && (
        <h4 className="text-sm font-semibold text-white mb-1.5 line-clamp-1 group-hover:text-cyan-200 transition-colors">
          {event.headline}
        </h4>
      )}

      {/* Short Description */}
      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3.5">
        {event.description}
      </p>

      {/* Footer: Source and Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/70 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400 max-w-[65%] truncate">
          <span className="text-slate-500">Source:</span>
          <span className="truncate text-slate-400 font-medium">
            {event.source || 'Data unavailable'}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(event)}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1 shadow-sm active:scale-95"
        >
          <span>VIEW DETAILS</span>
          <span className="text-xs">→</span>
        </button>
      </div>
    </div>
  );
};
