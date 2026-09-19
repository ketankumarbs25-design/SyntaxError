/**
 * FLOWSHIELD — Risk Classification
 *
 * Pure derivation from water depth and critical threshold.
 * No hardcoded outputs, no UI imports.
 *
 * Risk levels:
 *   ratio = water / criticalDepth
 *   SAFE     : ratio < 0.6
 *   WARNING  : 0.6 ≤ ratio < 1.0
 *   CRITICAL : ratio ≥ 1.0
 */

import type { RiskLevel } from './types';

/** Risk threshold: below this ratio the cell is SAFE */
export const WARNING_THRESHOLD = 0.6;

/** Risk threshold: at or above this ratio the cell is CRITICAL */
export const CRITICAL_THRESHOLD = 1.0;

/**
 * Classify a cell's risk based on its water depth relative to its critical depth.
 *
 * @param water         Current standing water depth (metres)
 * @param criticalDepth Water depth at which the cell becomes CRITICAL (metres)
 * @returns             The derived risk level
 */
export function classifyRisk(water: number, criticalDepth: number): RiskLevel {
  if (criticalDepth <= 0) {
    // Degenerate case: if criticalDepth is zero or negative, any water is critical
    return water > 0 ? 'CRITICAL' : 'SAFE';
  }

  const ratio = water / criticalDepth;

  if (ratio >= CRITICAL_THRESHOLD) return 'CRITICAL';
  if (ratio >= WARNING_THRESHOLD) return 'WARNING';
  return 'SAFE';
}
