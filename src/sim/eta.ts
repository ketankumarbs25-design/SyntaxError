/**
 * FLOWSHIELD — ETA to Critical
 *
 * Estimates the time until a cell reaches its critical water depth using
 * a least-squares linear regression over the last N timesteps.
 *
 * Key design decisions:
 * - Uses ordinary least-squares (OLS) slope, NOT a single-step delta.
 *   A single delta is noisy and causes ETA to flicker wildly.
 * - Slope ≤ 1e-6 m/min → ETA = null (water is effectively stable).
 * - Already critical → ETA = 0.
 * - Beyond horizon → ETA = null (don't display a huge number).
 * - Recomputed every step from the water history; never extrapolated from t=0.
 *
 * No React, no Motion, no UI imports.
 */

/**
 * Compute the least-squares slope of water depth over the last `window` timesteps.
 *
 * Uses the standard OLS formula for slope:
 *   slope = (N * Σ(x_i * y_i) - Σx_i * Σy_i) / (N * Σ(x_i²) - (Σx_i)²)
 *
 * where x_i are time indices and y_i are water depths.
 *
 * @param waterHistory  Array of water depths, oldest first. Length ≥ 1.
 * @param window        Number of recent values to use for regression.
 * @returns             Slope in metres/step (= metres/minute since dt=1)
 */
export function leastSquaresSlope(
  waterHistory: number[],
  window: number,
): number {
  // Take the last `window` values, or all if fewer exist
  const n = Math.min(window, waterHistory.length);
  if (n < 2) return 0;

  const values = waterHistory.slice(-n);

  // x values: 0, 1, 2, ..., n-1
  // Precompute sums for OLS
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0; // all x values identical (shouldn't happen with sequential indices)

  return (n * sumXY - sumX * sumY) / denom;
}

/**
 * Compute the estimated time (in minutes) until a cell reaches critical depth.
 *
 * @param waterHistory   Array of past water depths for this cell, oldest first.
 * @param criticalDepth  The cell's critical water depth (metres).
 * @param currentWater   The cell's current water depth (metres).
 * @param window         Number of past steps to use for slope computation.
 * @param horizon        Maximum ETA to report (minutes). Beyond → null.
 * @returns              ETA in minutes, 0 if already critical, or null if indeterminate.
 */
export function computeETA(
  waterHistory: number[],
  criticalDepth: number,
  currentWater: number,
  window: number,
  horizon: number,
): number | null {
  // Already at or above critical → ETA = 0
  if (currentWater >= criticalDepth) return 0;

  const slope = leastSquaresSlope(waterHistory, window);

  // If water is not rising appreciably, ETA is indeterminate
  // Threshold: 1e-6 m/min ≈ 0.06 mm/hr — effectively zero
  if (slope <= 1e-6) return null;

  // ETA = remaining depth / rate of rise
  const remaining = criticalDepth - currentWater;
  const eta = remaining / slope;

  // Beyond the prediction horizon → indeterminate
  if (eta > horizon) return null;

  // Clamp to non-negative (shouldn't happen given checks above, but be safe)
  return Math.max(0, eta);
}
