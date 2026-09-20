/**
 * FLOWSHIELD — Grid Generator
 *
 * Deterministic terrain generation using:
 * - mulberry32: seeded 32-bit PRNG
 * - Layered value noise: smooth terrain with a natural basin
 *
 * No React, no Motion, no UI imports.
 */

import type { Cell, SimConfig } from './types';

// ─── Mulberry32 PRNG ────────────────────────────────────────────────────────
//
// A fast, seedable 32-bit PRNG. Returns a function that yields floats in [0, 1).
// Reference: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c

export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Value Noise ────────────────────────────────────────────────────────────
//
// Simple 2D value noise via bilinear interpolation of random lattice values.
// We use multiple octaves to create natural-looking terrain.

/**
 * Generate a 2D hash table of random values for the noise lattice.
 * Size must be large enough to cover all octave lookups.
 */
function buildLattice(size: number, rng: () => number): number[][] {
  const lattice: number[][] = [];
  for (let i = 0; i <= size; i++) {
    lattice[i] = [];
    for (let j = 0; j <= size; j++) {
      lattice[i][j] = rng();
    }
  }
  return lattice;
}

/** Smooth interpolation (Hermite / smoothstep) to avoid grid artifacts */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Sample value noise at continuous coordinate (x, y).
 * The lattice wraps implicitly because we only query within bounds.
 */
function sampleNoise(
  x: number,
  y: number,
  lattice: number[][],
): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);

  // Bilinear interpolation of the four surrounding lattice points
  const v00 = lattice[iy][ix];
  const v10 = lattice[iy][ix + 1];
  const v01 = lattice[iy + 1][ix];
  const v11 = lattice[iy + 1][ix + 1];

  const top = v00 + (v10 - v00) * fx;
  const bot = v01 + (v11 - v01) * fx;
  return top + (bot - top) * fy;
}

/**
 * Layered value noise producing terrain with a natural basin.
 *
 * Three octaves (frequencies 1, 2, 4) with decreasing amplitude create
 * broad valleys with fine detail. A radial basin function pulls the centre
 * down, ensuring water collects naturally.
 *
 * @returns elevation in [0, 1] range before multiplier
 */
function terrainElevation(
  row: number,
  col: number,
  rows: number,
  cols: number,
  lattices: number[][][],
): number {
  // Normalised coordinates in [0, 1]
  const nx = col / (cols - 1 || 1);
  const ny = row / (rows - 1 || 1);

  // Three octaves of value noise
  // Octave 0: broad terrain shape (freq = 1, amp = 0.5)
  // Octave 1: medium features    (freq = 2, amp = 0.3)
  // Octave 2: fine detail         (freq = 4, amp = 0.2)
  const frequencies = [1, 2, 4];
  const amplitudes = [0.5, 0.3, 0.2];
  let elevation = 0;

  for (let o = 0; o < 3; o++) {
    const freq = frequencies[o];
    // Scale coordinates to lattice space. We sample at freq * normalised coords.
    const sx = nx * freq;
    const sy = ny * freq;
    elevation += sampleNoise(sx, sy, lattices[o]) * amplitudes[o];
  }

  // Basin function: radial distance from centre, pulled down quadratically.
  // This ensures the centre of the grid is lower — water flows toward it.
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const distSq = cx * cx + cy * cy;  // max ≈ 0.5 at corners
  const basin = distSq * 1.2;        // corners lifted, centre depressed

  elevation = elevation * 0.6 + basin * 0.4;

  return Math.max(0, Math.min(1, elevation));
}

// ─── Grid Creation ──────────────────────────────────────────────────────────

/**
 * Create the initial grid of cells with deterministic terrain.
 *
 * - Elevation: layered value noise + basin
 * - Population: inversely proportional to elevation (floodplains are more populated)
 * - CriticalDepth: varies by cell (0.3–0.8 m), lower in populated areas
 * - DrainageRate: base rate modulated by elevation
 */
export function createGrid(config: SimConfig): Cell[] {
  const { rows, cols, seed, elevationMultiplier, initialWater } = config;
  const rng = mulberry32(seed);

  // Build separate lattices for each noise octave to avoid correlation.
  // Each lattice needs to cover the frequency range: max freq = 4, so size ≥ 5.
  const lattices = [
    buildLattice(6, rng),   // octave 0: freq 1
    buildLattice(10, rng),  // octave 1: freq 2
    buildLattice(18, rng),  // octave 2: freq 4
  ];

  const cells: Cell[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rawElevation = terrainElevation(r, c, rows, cols, lattices);
      const elevation = rawElevation * elevationMultiplier;

      // Population: inversely weighted by elevation.
      // Lower areas (valleys, floodplains) have more people.
      // Range: ~100 – 5000
      const popFactor = 1 - rawElevation; // 0 (high) to 1 (low)
      const popNoise = 0.5 + rng() * 0.5; // 0.5–1.0 random variation
      const population = Math.round(100 + popFactor * popNoise * 4900);

      // Critical depth: realistic urban flood thresholds (5–12 cm of standing water)
      // Lower-elevation populated areas flood at shallower depths
      const criticalDepth = 0.04 + (1 - popFactor) * 0.06 + rng() * 0.02;

      // Drainage rate: realistic urban drainage ~0.0001–0.0005 m/min
      // (was 10x too high, causing water to drain faster than it accumulated)
      const drainageRate = 0.0001 + rawElevation * 0.0003 + rng() * 0.0001;

      // Ground capacity (for future saturation modelling)
      const groundCapacity = 0.05 + rawElevation * 0.1 + rng() * 0.02;

      cells.push({
        id: `r${r}c${c}`,
        row: r,
        col: c,
        elevation,
        groundCapacity,
        drainageRate,
        water: initialWater,
        population,
        criticalDepth,
      });
    }
  }

  return cells;
}
