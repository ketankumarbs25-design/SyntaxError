/**
 * FLOWSHIELD INDIA — Hydrological Flood Status & Trend Computation
 *
 * Core mathematical and hydrological threshold logic.
 * Computes official flood warning categories:
 * - Extreme: Water level >= Highest Flood Level (HFL)
 * - Severe: Water level >= Danger Level and < HFL
 * - Above normal: Water level >= Warning Level and < Danger Level
 * - Normal: Water level < Warning Level
 */

import type { StationStatus, TrendDirection } from './types';

export interface ThresholdParams {
  level: number;
  warningLevel: number;
  dangerLevel: number;
  hfl?: number | null;
}

/**
 * Computes official Central Water Commission (CWC) India Flood Warning Category.
 *
 * @param params Threshold parameters including current level, warning level, danger level, and HFL.
 * @returns StationStatus: 'Normal' | 'Above normal' | 'Severe' | 'Extreme'
 */
export function computeFloodStatus(params: ThresholdParams): StationStatus {
  const { level, warningLevel, dangerLevel, hfl } = params;

  if (typeof level !== 'number' || isNaN(level)) {
    return 'Normal';
  }

  // If HFL is defined and level has reached or exceeded HFL
  if (typeof hfl === 'number' && !isNaN(hfl) && hfl > 0) {
    if (level >= hfl) {
      return 'Extreme';
    }
  }

  // If level reaches or exceeds Danger level
  if (typeof dangerLevel === 'number' && !isNaN(dangerLevel) && dangerLevel > 0) {
    if (level >= dangerLevel) {
      return 'Severe';
    }
  }

  // If level reaches or exceeds Warning level
  if (typeof warningLevel === 'number' && !isNaN(warningLevel) && warningLevel > 0) {
    if (level >= warningLevel) {
      return 'Above normal';
    }
  }

  return 'Normal';
}

/**
 * Calculates trend direction (Rising, Falling, Steady) based on chronological observations.
 *
 * @param levels Chronological array of levels or observations
 * @param epsilon Threshold in meters below which change is considered steady (default: 0.02m)
 */
export function computeTrend(levels: number[], epsilon = 0.02): TrendDirection {
  if (!levels || levels.length < 2) {
    return 'Steady';
  }

  const latest = levels[levels.length - 1];
  const previous = levels[levels.length - 2];

  const diff = latest - previous;
  if (Math.abs(diff) < epsilon) {
    return 'Steady';
  }
  return diff > 0 ? 'Rising' : 'Falling';
}

/**
 * Computes the percentage of capacity or threshold fill relative to Warning/Danger/HFL.
 * Returns percentage (0 to 100+).
 */
export function computeCapacityUtilization(level: number, _warningLevel: number, dangerLevel: number, hfl: number): number {
  if (level <= 0 || dangerLevel <= 0) return 0;
  // If HFL is known, level / HFL * 100
  const maxRef = hfl > dangerLevel ? hfl : dangerLevel;
  const pct = (level / maxRef) * 100;
  return Math.min(Math.max(parseFloat(pct.toFixed(1)), 0), 150);
}

/**
 * Formats an ISO date or timestamp into Indian Standard Time (IST).
 */
export function formatIST(dateStrOrObj: string | Date | number): string {
  try {
    const d = new Date(dateStrOrObj);
    if (isNaN(d.getTime())) return String(dateStrOrObj);

    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateStrOrObj);
  }
}

/**
 * Formats date into short time in IST (e.g. "14:00 IST" or "02:30 PM")
 */
export function formatISTTime(dateStrOrObj: string | Date | number): string {
  try {
    const d = new Date(dateStrOrObj);
    if (isNaN(d.getTime())) return String(dateStrOrObj);

    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return String(dateStrOrObj);
  }
}
