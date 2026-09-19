/**
 * FLOWSHIELD — Simulation Types
 *
 * Pure data definitions for the flood-simulation engine.
 * No React, no Motion, no UI imports — ever.
 */

// ─── Risk Classification ────────────────────────────────────────────────────

/** Derived risk level based on water / criticalDepth ratio */
export type RiskLevel = 'SAFE' | 'WARNING' | 'CRITICAL';

// ─── Cell ───────────────────────────────────────────────────────────────────

/** A single grid cell with terrain, drainage, and state properties */
export interface Cell {
  /** Unique identifier: "r{row}c{col}" */
  id: string;
  /** Row index (0-based) */
  row: number;
  /** Column index (0-based) */
  col: number;
  /** Ground elevation in metres above datum */
  elevation: number;
  /** Maximum water the ground can absorb (metres), used for future saturation modelling */
  groundCapacity: number;
  /** Rate at which water drains into the ground (m/min) */
  drainageRate: number;
  /** Current standing water depth (metres, ≥ 0) */
  water: number;
  /** Simulated population living in this cell */
  population: number;
  /** Water depth at which this cell becomes CRITICAL (metres) */
  criticalDepth: number;
}

// ─── Classified Cell (with derived risk + ETA) ──────────────────────────────

/** Cell augmented with derived risk classification and ETA-to-critical */
export interface CellState extends Cell {
  /** Current risk level (derived from water / criticalDepth) */
  risk: RiskLevel;
  /**
   * Estimated time to reach criticalDepth (minutes).
   * - null  → slope ≤ 1e-6 or beyond horizon (render as "—")
   * - 0     → already critical
   * - > 0   → predicted minutes until critical
   */
  eta: number | null;
}

// ─── Simulation Statistics ──────────────────────────────────────────────────

/** Aggregate statistics for a single simulation timestep */
export interface SimStats {
  /** Count of cells with risk === 'SAFE' */
  safeCells: number;
  /** Count of cells with risk === 'WARNING' */
  warningCells: number;
  /** Count of cells with risk === 'CRITICAL' */
  criticalCells: number;
  /** Maximum water depth across all cells (metres) */
  maxWater: number;
  /** Mean water depth across all cells (metres) */
  avgWater: number;
  /** Number of cells that are WARNING or CRITICAL */
  affectedArea: number;
  /** Sum of population over WARNING + CRITICAL cells */
  affectedPopulation: number;
  /** Same as maxWater, explicit alias for display */
  maxDepth: number;
  /** Count of cells predicted to become critical (eta !== null && eta > 0) */
  predictedCriticalCount: number;
  /** Earliest ETA-to-critical across all non-critical cells (minutes), or null */
  earliestCriticalTime: number | null;
}

// ─── Simulation State (one timestep snapshot) ───────────────────────────────

/** Complete state of the simulation at a single point in time */
export interface SimState {
  /** Timestep index (0 = initial state before any rain) */
  step: number;
  /** Elapsed simulation time (minutes) */
  time: number;
  /** All cell states for this timestep */
  cells: CellState[];
  /** Total water in the system (metres, summed across cells) */
  totalWater: number;
  /** Aggregate statistics */
  stats: SimStats;
}

// ─── Simulation Configuration ───────────────────────────────────────────────

/** All user-controllable and fixed parameters for a simulation run */
export interface SimConfig {
  /** Number of grid rows */
  rows: number;
  /** Number of grid columns */
  cols: number;
  /** Seed for the deterministic PRNG (mulberry32) */
  seed: number;

  // ── Rainfall ──
  /** Rainfall intensity (mm/hr) */
  rainfallIntensity: number;
  /** Duration of rainfall (minutes). Simulation runs for this many steps. */
  rainfallDuration: number;

  // ── Drainage ──
  /** Global drainage efficiency multiplier (0–1) */
  drainageEfficiency: number;

  // ── Flow ──
  /** Inter-cell flow coefficient k (dimensionless) */
  flowCoefficient: number;

  // ── Terrain ──
  /** Multiplier applied to generated elevations */
  elevationMultiplier: number;

  // ── Initial conditions ──
  /** Uniform initial water depth across all cells (metres) */
  initialWater: number;

  // ── Stability ──
  /**
   * Safety factor for the outflow stability clamp.
   * A cell may send at most (water * safetyFactor) total outflow per step.
   * Default: 0.5
   */
  safetyFactor: number;

  // ── Time ──
  /** Timestep size (minutes). Fixed at 1. */
  dt: number;

  // ── ETA ──
  /** Number of past steps used for least-squares ETA slope. Default: 5 */
  etaWindow: number;
  /** Maximum ETA horizon (minutes). Beyond this → null. */
  etaHorizon: number;
}

/** Sensible default configuration */
export const DEFAULT_CONFIG: SimConfig = {
  rows: 8,
  cols: 8,
  seed: 42,
  rainfallIntensity: 80,   // Heavy preset
  rainfallDuration: 90,    // 90 minutes
  drainageEfficiency: 1.0,
  flowCoefficient: 0.15,
  elevationMultiplier: 1.0,
  initialWater: 0,
  safetyFactor: 0.5,
  dt: 1,
  etaWindow: 5,
  etaHorizon: 180,         // 3 hours
};
