/**
 * FLOWSHIELD — Simulation Runner
 *
 * Orchestrates a full simulation run:
 *   1. Create the grid from config
 *   2. Build initial SimState (step 0, before any rain)
 *   3. Loop step() for rainfallDuration + extra drain steps
 *   4. Return the full timeline: SimState[]
 *
 * No React, no Motion, no UI imports.
 */

import type { SimConfig, SimState, CellState } from './types';
import { DEFAULT_CONFIG } from './types';
import { createGrid } from './grid';
import { step } from './engine';
import { classifyRisk } from './risk';

/**
 * Run a complete flood simulation with the given configuration.
 *
 * @param userConfig  Partial config; missing fields fall back to DEFAULT_CONFIG.
 * @returns           Array of SimState snapshots, one per timestep (including t=0).
 */
export function run(userConfig: Partial<SimConfig> = {}): SimState[] {
  const config: SimConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const { rows, cols, rainfallDuration } = config;
  const n = rows * cols;

  // ── Create terrain ────────────────────────────────────────────────────
  const baseCells = createGrid(config);

  // ── Build initial state (step 0) ──────────────────────────────────────
  const initialCells: CellState[] = baseCells.map(cell => ({
    ...cell,
    risk: classifyRisk(cell.water, cell.criticalDepth),
    eta: null, // No history yet
  }));

  // Per-cell water history for ETA computation
  const waterHistory: number[][] = Array.from({ length: n }, (_, i) => [initialCells[i].water]);

  let totalWater = 0;
  for (const cell of initialCells) {
    totalWater += cell.water;
  }

  // Compute initial stats
  let safeCells = 0, warningCells = 0, criticalCells = 0;
  let maxWater = 0, affectedArea = 0, affectedPopulation = 0;
  for (const cell of initialCells) {
    if (cell.water > maxWater) maxWater = cell.water;
    switch (cell.risk) {
      case 'SAFE': safeCells++; break;
      case 'WARNING':
        warningCells++; affectedArea++; affectedPopulation += cell.population; break;
      case 'CRITICAL':
        criticalCells++; affectedArea++; affectedPopulation += cell.population; break;
    }
  }
  const avgWater = totalWater / n;

  const initialState: SimState = {
    step: 0,
    time: 0,
    cells: initialCells,
    totalWater,
    stats: {
      safeCells,
      warningCells,
      criticalCells,
      maxWater,
      avgWater,
      affectedArea,
      affectedPopulation,
      maxDepth: maxWater,
      predictedCriticalCount: 0,
      earliestCriticalTime: null,
    },
  };

  // ── Run simulation ────────────────────────────────────────────────────
  // Run for rainfallDuration steps (rain falls), then continue for 50% more
  // steps to let water drain and flow settle.
  const totalSteps = Math.ceil(rainfallDuration * 1.5);

  const timeline: SimState[] = [initialState];
  let currentState = initialState;

  for (let t = 0; t < totalSteps; t++) {
    currentState = step(currentState, config, waterHistory);
    timeline.push(currentState);
  }

  return timeline;
}

// Re-export everything downstream consumers need
export { createGrid } from './grid';
export { mulberry32 } from './grid';
export { step } from './engine';
export { classifyRisk, WARNING_THRESHOLD, CRITICAL_THRESHOLD } from './risk';
export { computeETA, leastSquaresSlope } from './eta';
export { DEFAULT_CONFIG } from './types';
export type { Cell, CellState, SimConfig, SimState, SimStats, RiskLevel } from './types';
