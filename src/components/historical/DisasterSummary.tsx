/**
 * FLOWSHIELD — Disaster Summary Component
 *
 * Displays categorical disaster metrics.
 * Rule: Only displays categories that actually have relevant events (count > 0).
 * Provides interactive category filtering for the timeline.
 */

import React from 'react';
import { BarChart3, Layers } from 'lucide-react';
import type { DisasterCategoryCount, DisasterType } from '../../types/disaster';
import { getDisasterLucideIcon } from './disasterIcons';

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
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--text)]',
    activeBg: 'bg-[var(--primary)] text-white border-[var(--primary)]',
  },
  'Extreme Rainfall': {
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--text)]',
    activeBg: 'bg-[var(--primary)] text-white border-[var(--primary)]',
  },
  Landslide: {
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--text)]',
    activeBg: 'bg-[var(--primary)] text-white border-[var(--primary)]',
  },
  Cyclone: {
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--text)]',
    activeBg: 'bg-[var(--primary)] text-white border-[var(--primary)]',
  },
  Earthquake: {
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--text)]',
    activeBg: 'bg-[var(--primary)] text-white border-[var(--primary)]',
  },
  Drought: {
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--text)]',
    activeBg: 'bg-[var(--primary)] text-white border-[var(--primary)]',
  },
  Other: {
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border)]',
    text: 'text-[var(--text)]',
    activeBg: 'bg-[var(--primary)] text-white border-[var(--primary)]',
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
        <h3 className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Disaster summary</span>
        </h3>
        <span className="text-[11px] text-[var(--text-muted)]">
          Click any category to filter timeline
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* All Filter Tab */}
        <button
          onClick={() => onSelectCategory('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-xs'
              : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All events</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[var(--surface)] text-[10px] text-[var(--text)] font-mono">
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
                  : `${style.bg} ${style.border} ${style.text} hover:text-[var(--text)]`
              }`}
            >
              <span className="flex items-center">{getDisasterLucideIcon(cat.type, { className: 'w-3.5 h-3.5' })}</span>
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-semibold ${
                  isSelected
                    ? 'bg-black/20 text-white'
                    : 'bg-[var(--surface)] text-[var(--text-muted)]'
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
