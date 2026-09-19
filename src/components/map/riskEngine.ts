/**
 * FLOWSHIELD — Flood Risk Spatial Engine
 *
 * Calculates a dynamic 0–100 flood risk score for each of the 64 zones
 * using:
 * 1. Rain Intensity
 * 2. Storm Duration
 * 3. Drainage Quality
 * 4. Terrain Steepness & Ground Elevation
 * 5. Current Hydrodynamic Water Depth & Cell Risk
 * 6. 2D Spatial Neighbor Water Spread (diffusion)
 *
 * Risk Tiers:
 *   0–25   : 🟢 SAFE
 *   26–50  : 🟡 AT RISK
 *   51–75  : 🟠 WARNING
 *   76–100 : 🔴 FLOODING
 */

import type { CellState, SimConfig } from '../../sim/types';

export type FloodRiskLevel = 'SAFE' | 'AT_RISK' | 'WARNING' | 'FLOODING';

export interface ZoneRiskAssessment {
  cellId: string;
  zoneName: string;
  row: number;
  col: number;
  score: number; // 0–100
  level: FloodRiskLevel;
  levelLabel: string;
  badgeClass: string;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
  waterDepth: number;
  criticalDepth: number;
  population: number;
  elevation: number;
}

export function getZoneName(row: number, col: number): string {
  const letter = String.fromCharCode(65 + row);
  return `${letter}${col + 1}`;
}

/**
 * Compute the comprehensive flood risk scores and spatial diffusion for all 64 cells.
 */
export function computeGridRiskAssessments(
  cells: CellState[],
  config: SimConfig
): Map<string, ZoneRiskAssessment> {
  const { rainfallIntensity, rainfallDuration, drainageEfficiency, elevationMultiplier } = config;

  // ─── 1. Parameter Contributions (Global) ──────────────────────────────────
  // Rainfall intensity (0 to 200 mm/hr): 0 to 48 points
  // 20 mm/hr  -> ~5 pts
  // 80 mm/hr  -> ~22 pts
  // 160 mm/hr -> ~42 pts
  const rainContribution = (rainfallIntensity / 200) * 48;

  // Storm duration (15 to 180 min): 0 to 18 points
  // 15 min  -> ~0 pts
  // 90 min  -> ~9 pts
  // 180 min -> ~18 pts
  const durationContribution = ((Math.max(15, rainfallDuration) - 15) / 165) * 18;

  // Drainage efficiency (0 to 1.0): -22 to +25 points
  // 100% (1.0) -> -22 pts (strong relief)
  // 50%  (0.5) -> +2 pts
  // 15%  (0.15)-> +18 pts (significant flooding risk)
  // 0%   (0.0) -> +25 pts
  const drainageContribution = (1 - drainageEfficiency) * 47 - 22;

  // ─── 2. Terrain & Elevation Statistics ─────────────────────────────────────
  let minElevation = Infinity;
  let maxElevation = -Infinity;
  for (const cell of cells) {
    if (cell.elevation < minElevation) minElevation = cell.elevation;
    if (cell.elevation > maxElevation) maxElevation = cell.elevation;
  }
  const elevationRange = Math.max(0.05, maxElevation - minElevation);

  // ─── 3. Compute First-Pass Raw Scores for Each Cell ────────────────────────
  const rawScores = new Map<string, number>();

  for (const cell of cells) {
    // Terrain contribution: lower elevation basin/depression accumulates water
    // Basin cells (elevation ~ min): +28 pts
    // Hilltop cells (elevation ~ max): -16 pts
    const normalizedElevation = (cell.elevation - minElevation) / elevationRange; // 0=lowest, 1=highest
    const basinFactor = 1 - normalizedElevation; // 1=lowest basin, 0=ridge
    const terrainContribution =
      (basinFactor * 44 - 16) * Math.min(1.8, Math.max(0.5, elevationMultiplier));

    // Hydrodynamic water level contribution
    const waterRatio = cell.criticalDepth > 0 ? cell.water / cell.criticalDepth : 0;
    const directWaterContrib = waterRatio * 36;

    // Base score sum
    let rawScore =
      rainContribution +
      durationContribution +
      drainageContribution +
      terrainContribution +
      directWaterContrib;

    // Guaranteed status overrides based on hydrodynamic simulation
    if (cell.risk === 'CRITICAL') {
      rawScore = Math.max(rawScore, 78 + Math.min(22, (waterRatio - 1.0) * 20));
    } else if (cell.risk === 'WARNING') {
      rawScore = Math.max(rawScore, 53 + (waterRatio - 0.6) * 32);
    }

    rawScores.set(cell.id, rawScore);
  }

  // ─── 4. Spatial Diffusion / Neighboring Water Contribution ─────────────────
  // Water propagates from high-risk cells to immediate orthogonal neighbors
  // e.g., if B4 is FLOODING (85), neighbors A4, B3, B5, C4 get spillover into WARNING (55–65)
  const results = new Map<string, ZoneRiskAssessment>();

  for (const cell of cells) {
    const { row, col, water, criticalDepth, population, elevation } = cell;
    const zoneName = getZoneName(row, col);
    const cellRawScore = rawScores.get(cell.id) || 0;

    // Collect 4 orthogonal neighbors
    const neighbors = [
      rawScores.get(`r${row - 1}c${col}`),
      rawScores.get(`r${row + 1}c${col}`),
      rawScores.get(`r${row}c${col - 1}`),
      rawScores.get(`r${row}c${col + 1}`),
    ].filter((s): s is number => s !== undefined);

    let maxNeighborScore = 0;
    for (const n of neighbors) {
      if (n > maxNeighborScore) maxNeighborScore = n;
    }

    // Spillover calculation:
    // If a neighbor is in Warning or Flooding (> 50), propagate 35% of the risk delta
    let neighborContribution = 0;
    if (maxNeighborScore > 50 && maxNeighborScore > cellRawScore) {
      neighborContribution = (maxNeighborScore - cellRawScore) * 0.35;
    }

    // Final normalized score between 0 and 100
    const finalScore = Math.min(
      100,
      Math.max(0, Math.round(cellRawScore + neighborContribution))
    );

    // ─── 5. Classify Score into Risk Tiers ──────────────────────────────────
    // 0–25   : SAFE
    // 26–50  : AT RISK
    // 51–75  : WARNING
    // 76–100 : FLOODING
    let level: FloodRiskLevel;
    let levelLabel: string;
    let badgeClass: string;
    let fillColor: string;
    let fillOpacity: number;
    let strokeColor: string;
    let strokeWeight: number;

    if (finalScore >= 76) {
      level = 'FLOODING';
      levelLabel = '🔴 FLOODING';
      badgeClass = 'bg-red-500/20 text-red-300 border-red-500/60 font-bold';
      fillColor = '#ef4444';
      fillOpacity = 0.48; // Visible transparent red, map streets visible
      strokeColor = '#b91c1c';
      strokeWeight = 2.5;
    } else if (finalScore >= 51) {
      level = 'WARNING';
      levelLabel = '🟠 WARNING';
      badgeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/60 font-semibold';
      fillColor = '#f97316';
      fillOpacity = 0.36; // Transparent orange
      strokeColor = '#c2410c';
      strokeWeight = 2.0;
    } else if (finalScore >= 26) {
      level = 'AT_RISK';
      levelLabel = '🟡 AT RISK';
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-medium';
      fillColor = '#eab308';
      fillOpacity = 0.28; // Transparent yellow
      strokeColor = '#a16207';
      strokeWeight = 1.5;
    } else {
      level = 'SAFE';
      levelLabel = '🟢 SAFE';
      badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-normal';
      fillColor = '#10b981';
      // Subtle green overlay (0.08) so the entire map is NOT a solid green block
      fillOpacity = 0.08;
      strokeColor = 'rgba(16, 185, 129, 0.28)';
      strokeWeight = 1.0;
    }

    results.set(cell.id, {
      cellId: cell.id,
      zoneName,
      row,
      col,
      score: finalScore,
      level,
      levelLabel,
      badgeClass,
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight,
      waterDepth: water,
      criticalDepth,
      population,
      elevation,
    });
  }

  return results;
}
