/**
 * FLOWSHIELD — Simulation Engine
 *
 * Pure function: step(state, config) → state
 * Immutable input, new state on output. No side effects.
 *
 * Timestep (dt = 1 min, explicit Euler), executed in this exact order:
 *
 * 1. RAINFALL
 *    water += (intensity_mm_hr / 60) * dt / 1000   [convert mm/hr → m/min → m/step]
 *
 * 2. INFILTRATION / DRAINAGE
 *    out = min(water, drainageRate × efficiency × dt)
 *
 * 3. INTER-CELL FLOW (Jacobi, 4-neighbour)
 *    Computed against the PREVIOUS state (Jacobi, not Gauss–Seidel).
 *    head_i = elevation_i + water_i
 *    For each neighbour j where head_i > head_j:
 *      q_ij = k × (head_i - head_j) × dt
 *
 *    STABILITY CLAMP:
 *      S = Σ q_ij; if S > water_i × SAFETY → scale all q_ij down.
 *
 * 4. APPLY DELTAS, clamp water ≥ 0
 *
 * 5. CONSERVATION ASSERTION: |expected - actual| < 1e-9
 *
 * 6. CLASSIFY + RECORD
 *
 * No React, no Motion, no UI imports — ever.
 */

import type { CellState, SimConfig, SimState, SimStats } from './types';
import { classifyRisk } from './risk';
import { computeETA } from './eta';

// ─── Neighbour offsets (4-connected: up, down, left, right) ─────────────────
const NEIGHBOURS: [number, number][] = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1],  // right
];

/**
 * Get the 1D index for a (row, col) pair in a row-major grid.
 */
function idx(row: number, col: number, cols: number): number {
  return row * cols + col;
}

/**
 * Compute aggregate statistics from classified cells.
 */
function computeStats(cells: CellState[]): SimStats {
  let safeCells = 0;
  let warningCells = 0;
  let criticalCells = 0;
  let maxWater = 0;
  let totalWater = 0;
  let affectedArea = 0;
  let affectedPopulation = 0;
  let predictedCriticalCount = 0;
  let earliestCriticalTime: number | null = null;

  for (const cell of cells) {
    totalWater += cell.water;
    if (cell.water > maxWater) maxWater = cell.water;

    switch (cell.risk) {
      case 'SAFE':
        safeCells++;
        break;
      case 'WARNING':
        warningCells++;
        affectedArea++;
        affectedPopulation += cell.population;
        break;
      case 'CRITICAL':
        criticalCells++;
        affectedArea++;
        affectedPopulation += cell.population;
        break;
    }

    // Count cells predicted to go critical
    if (cell.eta !== null && cell.eta > 0) {
      predictedCriticalCount++;
      if (earliestCriticalTime === null || cell.eta < earliestCriticalTime) {
        earliestCriticalTime = cell.eta;
      }
    }
  }

  return {
    safeCells,
    warningCells,
    criticalCells,
    maxWater,
    avgWater: totalWater / cells.length,
    affectedArea,
    affectedPopulation,
    maxDepth: maxWater,
    predictedCriticalCount,
    earliestCriticalTime,
  };
}

/**
 * Execute one simulation timestep.
 *
 * PURE FUNCTION: does not mutate the input state.
 * Returns a new SimState representing the world after one dt.
 *
 * @param prevState     The simulation state at time t
 * @param config        Simulation configuration (immutable)
 * @param waterHistory  Per-cell water history for ETA computation (oldest first).
 *                      This is mutated by the caller (index.ts), not here.
 * @returns             New SimState at time t + dt
 */
export function step(
  prevState: SimState,
  config: SimConfig,
  waterHistory: number[][],
): SimState {
  const { rows, cols, rainfallIntensity, rainfallDuration, drainageEfficiency,
    flowCoefficient, safetyFactor, dt, etaWindow, etaHorizon } = config;
  const n = rows * cols;

  // Start with a copy of previous water levels
  const prevWater = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    prevWater[i] = prevState.cells[i].water;
  }

  // Working water array (will be modified in-place through the steps)
  const water = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    water[i] = prevWater[i];
  }

  // Track total water added and removed for conservation check
  let totalRainAdded = 0;
  let totalDrained = 0;

  // ── Step 1: Rainfall ──────────────────────────────────────────────────
  // water += (intensity_mm_hr / 60) * dt / 1000   [convert mm/hr → m/min → m/step]
  const isRaining = prevState.time < rainfallDuration;
  const rainPerStep = isRaining ? (rainfallIntensity / 60) * dt / 1000 : 0;

  if (rainPerStep > 0) {
    for (let i = 0; i < n; i++) {
      water[i] += rainPerStep;
      totalRainAdded += rainPerStep;
    }
  }

  // ── Step 2: Infiltration / Drainage ───────────────────────────────────
  // out = min(water, drainageRate × efficiency × dt)
  for (let i = 0; i < n; i++) {
    const cell = prevState.cells[i];
    const maxDrain = cell.drainageRate * drainageEfficiency * dt;
    const drained = Math.min(water[i], maxDrain);
    water[i] -= drained;
    totalDrained += drained;
  }

  // ── Step 3: Inter-cell flow (Jacobi, 4-neighbour) ────────────────────
  //
  // Jacobi method: compute ALL flows from the PREVIOUS state, then apply.
  // This ensures no iteration-order bias.

  // Per-cell net flow delta (positive = gaining water)
  const flowDelta = new Float64Array(n);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = idx(r, c, cols);
      const cell_i = prevState.cells[i];
      const head_i = cell_i.elevation + water[i];  // Use post-rain/drainage water

      // Compute potential outflows to each lower-head neighbour
      const outflows: { j: number; q: number }[] = [];
      let totalOutflow = 0;

      for (const [dr, dc] of NEIGHBOURS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

        const j = idx(nr, nc, cols);
        const cell_j = prevState.cells[j];
        const head_j = cell_j.elevation + water[j];

        // Flow only toward LOWER head — never uphill
        if (head_i <= head_j) continue;

        const drop = head_i - head_j;
        // q_ij = k × drop × dt
        const q = flowCoefficient * drop * dt;
        outflows.push({ j, q });
        totalOutflow += q;
      }

      // STABILITY CLAMP: limit total outflow to water_i × SAFETY
      // Prevents oscillation and ensures a cell never sends more than it holds.
      const maxOutflow = water[i] * safetyFactor;
      let scale = 1;
      if (totalOutflow > maxOutflow && totalOutflow > 0) {
        scale = maxOutflow / totalOutflow;
      }

      // Apply scaled outflows
      for (const { j, q } of outflows) {
        const actualQ = q * scale;
        flowDelta[i] -= actualQ;  // Cell i loses water
        flowDelta[j] += actualQ;  // Neighbour j gains water
      }
    }
  }

  // ── Step 4: Apply deltas, clamp water ≥ 0 ────────────────────────────
  for (let i = 0; i < n; i++) {
    water[i] += flowDelta[i];
    if (water[i] < 0) water[i] = 0; // Numerical safety
  }

  // ── Step 5: Conservation assertion ────────────────────────────────────
  // |water_added − water_removed − Δtotal_water| < 1e-9
  let totalWaterPrev = 0;
  let totalWaterNew = 0;
  for (let i = 0; i < n; i++) {
    totalWaterPrev += prevWater[i];
    totalWaterNew += water[i];
  }

  const waterDelta = totalWaterNew - totalWaterPrev;
  const expected = totalRainAdded - totalDrained;
  const conservationError = Math.abs(expected - waterDelta);

  if (conservationError > 1e-9) {
    throw new Error(
      `Conservation violated at step ${prevState.step + 1}: ` +
      `|${expected.toExponential(4)} − ${waterDelta.toExponential(4)}| = ` +
      `${conservationError.toExponential(4)} > 1e-9`
    );
  }

  // ── Step 6: Classify + record ─────────────────────────────────────────
  const newStep = prevState.step + 1;
  const newTime = prevState.time + dt;

  const newCells: CellState[] = prevState.cells.map((prevCell, i) => {
    const currentWater = water[i];

    // Push to water history (caller manages the array)
    waterHistory[i].push(currentWater);

    const risk = classifyRisk(currentWater, prevCell.criticalDepth);
    const eta = computeETA(
      waterHistory[i],
      prevCell.criticalDepth,
      currentWater,
      etaWindow,
      etaHorizon,
    );

    return {
      ...prevCell,
      water: currentWater,
      risk,
      eta,
    };
  });

  const stats = computeStats(newCells);

  return {
    step: newStep,
    time: newTime,
    cells: newCells,
    totalWater: totalWaterNew,
    stats,
  };
}
