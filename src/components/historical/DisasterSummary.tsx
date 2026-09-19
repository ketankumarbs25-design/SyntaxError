/**
 * FLOWSHIELD — Disaster Summary Component
 *
 * Displays categorical disaster metrics.
 * Rule: Only displays categories that actually have relevant events (count > 0).
 * Provides interactive category filtering for the timeline.
 */

import React from 'react';
import type { DisasterCategoryCount, DisasterType } from '../../types/disaster';

interface DisasterSummaryProps {
  categories: DisasterCategoryCount[];
  selectedCategory: DisasterType | 'ALL';
  onSelectCategory: (category: DisasterType | 'ALL') => void;
  totalEvents: number;
}

const CATEGORY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; activeBg: string }
> = {
  Flood: {
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    activeBg: 'bg-cyan-500/30 border-cyan-400 ring-1 ring-cyan-400/40',
  },
  'Extreme Rainfall': {
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    activeBg: 'bg-blue-500/30 border-blue-400 ring-1 ring-blue-400/40',
  },
  Landslide: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    activeBg: 'bg-amber-500/30 border-amber-400 ring-1 ring-amber-400/40',
  },
  Cyclone: {
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    activeBg: 'bg-purple-500/30 border-purple-400 ring-1 ring-purple-400/40',
  },
  Earthquake: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    activeBg: 'bg-emerald-500/30 border-emerald-400 ring-1 ring-emerald-400/40',
  },
  Drought: {
    bg: 'bg-yellow-500/10 hover:bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    activeBg: 'bg-yellow-500/30 border-yellow-400 ring-1 ring-yellow-400/40',
  },
  Other: {
    bg: 'bg-slate-500/10 hover:bg-slate-500/20',
    border: 'border-slate-500/30',
    text: 'text-slate-300',
    activeBg: 'bg-slate-500/30 border-slate-400 ring-1 ring-slate-400/40',
  },
};

export const DisasterSummary: React.FC<DisasterSummaryProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalEvents,
}) => {
  // STRICT REQUIREMENT: Only display categories that actually have events
  const activeCategories = categories.filter((cat) => cat.count > 0);

  if (activeCategories.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <span>📊</span>
          <span>Disaster Summary</span>
        </h3>
        <span className="text-[11px] text-slate-500">
          Click any category to filter timeline
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* All Filter Tab */}
        <button
          onClick={() => onSelectCategory('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-slate-700/60 border-slate-500 text-white shadow-md shadow-black/40 ring-1 ring-slate-400/40'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>🌐 All Events</span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono">
            {totalEvents}
          </span>
        </button>

        {/* Specific Active Categories */}
        {activeCategories.map((cat) => {
          const style = CATEGORY_STYLES[cat.type] || CATEGORY_STYLES.Other;
          const isSelected = selectedCategory === cat.type;

          return (
            <button
              key={cat.type}
              onClick={() => onSelectCategory(isSelected ? 'ALL' : cat.type)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isSelected
                  ? style.activeBg
                  : `${style.bg} ${style.border} ${style.text}`
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isSelected
                    ? 'bg-black/40 text-white'
                    : 'bg-black/30 text-slate-300'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
