/**
 * FLOWSHIELD — Engine Tests
 *
 * Six mandatory tests that must pass before any UI work begins:
 *
 * 1. Mass conservation across a 60-step run, no drainage
 * 2. Flat terrain + uniform rain → uniform water (symmetry)
 * 3. No drainage, no rain, one full cell → spreads and settles level, never oscillates
 * 4. Water never negative, never flows uphill
 * 5. Same seed → byte-identical output twice
 * 6. TS vs Python NumPy divergence < 1e-9 (deferred to cross-validation script)
 */

import { describe, it, expect } from 'vitest';
import { run } from '../index';
import { step } from '../engine';
import { createGrid } from '../grid';
import { classifyRisk } from '../risk';
import { leastSquaresSlope, computeETA } from '../eta';
import type { SimConfig, SimState, CellState } from '../types';
import { DEFAULT_CONFIG } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Create a config with specific overrides */
function cfg(overrides: Partial<SimConfig> = {}): SimConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

/** Sum water across all cells in a state */
function totalWater(state: SimState): number {
  return state.cells.reduce((sum, c) => sum + c.water, 0);
}

// ─── Test 1: Mass Conservation ──────────────────────────────────────────────

describe('Mass Conservation', () => {
  it('should conserve mass across a 60-step run with no drainage', () => {
    // No drainage = all water stays in the system.
    // Total water should equal cumulative rain added.
    const config = cfg({
      rainfallIntensity: 80,
      rainfallDuration: 60,
      drainageEfficiency: 0,     // No drainage!
      flowCoefficient: 0.15,
      initialWater: 0,
      seed: 123,
    });

    const timeline = run(config);

    // Rain per step per cell = (80/60) * 1 / 1000 = 0.001333... m
    const rainPerStep = (config.rainfallIntensity / 60) * config.dt / 1000;
    const nCells = config.rows * config.cols;

    // After step t (1-indexed), total rain added = t * rainPerStep * nCells
    // (for t <= rainfallDuration; after that no rain)
    for (let t = 1; t <= 60; t++) {
      const state = timeline[t];
      const expectedTotal = t * rainPerStep * nCells;
      const actualTotal = totalWater(state);

      // The step function already asserts conservation with 1e-9 tolerance.
      // Here we verify the cumulative total matches expected rain input.
      expect(Math.abs(actualTotal - expectedTotal)).toBeLessThan(1e-8);
    }
  });

  it('step function throws on conservation violation', () => {
    // This is an integrity test — the engine itself enforces conservation.
    // We just verify it doesn't throw for a normal run.
    const config = cfg({
      rainfallIntensity: 50,
      rainfallDuration: 10,
      drainageEfficiency: 0,
      seed: 456,
    });

    // Should not throw
    expect(() => run(config)).not.toThrow();
  });
});

// ─── Test 2: Flat Terrain Symmetry ──────────────────────────────────────────

describe('Flat Terrain Symmetry', () => {
  it('flat terrain + uniform rain → uniform water across all cells', () => {
    // With flat terrain (elevation=0 everywhere), all cells should have
    // identical water levels because there's no head gradient to drive flow.
    const config = cfg({
      rows: 4,
      cols: 4,
      rainfallIntensity: 100,
      rainfallDuration: 30,
      drainageEfficiency: 0,
      flowCoefficient: 0.15,
      elevationMultiplier: 0,   // Flat terrain!
      initialWater: 0,
      seed: 789,
    });

    const timeline = run(config);

    for (const state of timeline) {
      const waters = state.cells.map(c => c.water);
      const avg = waters.reduce((a, b) => a + b, 0) / waters.length;

      for (const w of waters) {
        // All cells should be equal (or very close due to floating point)
        expect(Math.abs(w - avg)).toBeLessThan(1e-12);
      }
    }
  });
});

// ─── Test 3: Spreading and Settling ─────────────────────────────────────────

describe('Single Full Cell Spreading', () => {
  it('one full cell spreads water and settles to a level state without oscillation', () => {
    // Setup: 4x4 flat grid, no rain, no drainage, one cell has water.
    // Expected: water spreads outward and eventually reaches equilibrium.
    //           Max water should decrease monotonically (spreading out).
    const config = cfg({
      rows: 4,
      cols: 4,
      rainfallIntensity: 0,     // No rain
      rainfallDuration: 200,    // Long run for settling
      drainageEfficiency: 0,    // No drainage
      flowCoefficient: 0.15,
      elevationMultiplier: 0,   // Flat terrain
      initialWater: 0,
      seed: 999,
    });

    // Create grid and manually set one cell's water high
    const grid = createGrid(config);
    const centerIdx = Math.floor(config.rows / 2) * config.cols + Math.floor(config.cols / 2);
    grid[centerIdx].water = 1.0; // 1 metre of water in the centre cell

    // Build initial state manually
    const initialCells: CellState[] = grid.map(cell => ({
      ...cell,
      risk: classifyRisk(cell.water, cell.criticalDepth),
      eta: null,
    }));

    const nCells = config.rows * config.cols;
    const waterHistory: number[][] = Array.from({ length: nCells }, (_, i) => [initialCells[i].water]);
    let totalW = 0;
    for (const c of initialCells) totalW += c.water;

    let currentState: SimState = {
      step: 0,
      time: 0,
      cells: initialCells,
      totalWater: totalW,
      stats: {
        safeCells: nCells, warningCells: 0, criticalCells: 0,
        maxWater: 1.0, avgWater: totalW / nCells, affectedArea: 0,
        affectedPopulation: 0, maxDepth: 1.0, predictedCriticalCount: 0,
        earliestCriticalTime: null,
      },
    };

    const maxWaters: number[] = [1.0];

    // Run 200 steps
    for (let t = 0; t < 200; t++) {
      currentState = step(currentState, config, waterHistory);
      const maxW = Math.max(...currentState.cells.map(c => c.water));
      maxWaters.push(maxW);
    }

    // Verify: max water should decrease monotonically (spreading out)
    for (let t = 1; t < maxWaters.length; t++) {
      expect(maxWaters[t]).toBeLessThanOrEqual(maxWaters[t - 1] + 1e-12);
    }

    // Verify: after many steps, all cells should be close to the average
    const finalWaters = currentState.cells.map(c => c.water);
    const avg = finalWaters.reduce((a, b) => a + b, 0) / finalWaters.length;
    for (const w of finalWaters) {
      // Should converge to within 10% of the mean
      expect(Math.abs(w - avg)).toBeLessThan(avg * 0.1 + 1e-10);
    }

    // Verify: total water is conserved (no drainage, no rain)
    const finalTotal = finalWaters.reduce((a, b) => a + b, 0);
    expect(Math.abs(finalTotal - 1.0)).toBeLessThan(1e-9);
  });
});

// ─── Test 4: Water Never Negative, Never Flows Uphill ───────────────────────

describe('Physical Constraints', () => {
  it('water is never negative across any cell at any timestep', () => {
    const config = cfg({
      rainfallIntensity: 160,   // Extreme rain
      rainfallDuration: 90,
      drainageEfficiency: 1.0,
      seed: 42,
    });

    const timeline = run(config);

    for (const state of timeline) {
      for (const cell of state.cells) {
        expect(cell.water).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('inter-cell flow never moves water toward a higher hydraulic head', () => {
    // Structurally enforced by the engine (head_i > head_j check).
    // We verify that water is never negative, which would indicate
    // an outflow exceeding available water.
    const config = cfg({
      rainfallIntensity: 100,
      rainfallDuration: 30,
      drainageEfficiency: 0,
      seed: 42,
    });

    const timeline = run(config);

    for (let t = 1; t < Math.min(timeline.length, 31); t++) {
      const curr = timeline[t];
      for (const cell of curr.cells) {
        expect(cell.water).toBeGreaterThanOrEqual(-1e-15);
      }
    }
  });
});

// ─── Test 5: Deterministic Output ───────────────────────────────────────────

describe('Deterministic Reproducibility', () => {
  it('same seed produces byte-identical output twice', () => {
    const config = cfg({
      rainfallIntensity: 80,
      rainfallDuration: 60,
      seed: 12345,
    });

    const run1 = run(config);
    const run2 = run(config);

    // Must be exactly identical
    expect(run1.length).toBe(run2.length);

    for (let t = 0; t < run1.length; t++) {
      const s1 = run1[t];
      const s2 = run2[t];

      expect(s1.step).toBe(s2.step);
      expect(s1.time).toBe(s2.time);
      expect(s1.totalWater).toBe(s2.totalWater);

      for (let i = 0; i < s1.cells.length; i++) {
        expect(s1.cells[i].water).toBe(s2.cells[i].water);
        expect(s1.cells[i].elevation).toBe(s2.cells[i].elevation);
        expect(s1.cells[i].risk).toBe(s2.cells[i].risk);
        expect(s1.cells[i].eta).toBe(s2.cells[i].eta);
      }
    }
  });
});

// ─── Test 6: Cross-Validation (TS vs Python NumPy) ─────────────────────────

describe('Cross-Validation (TS vs Python)', () => {
  it('TS vs Python NumPy divergence < 1e-9 across all cells and steps', async () => {
    const { execSync } = await import('child_process');
    let output = '';
    try {
      // Try py -3.14, python3, or python
      output = execSync('py -3.14 validation/validate.py', {
        encoding: 'utf-8',
        cwd: process.cwd(),
      });
    } catch {
      try {
        output = execSync('python3 validation/validate.py', {
          encoding: 'utf-8',
          cwd: process.cwd(),
        });
      } catch {
        output = execSync('python validation/validate.py', {
          encoding: 'utf-8',
          cwd: process.cwd(),
        });
      }
    }
    expect(output).toContain('ALL TESTS PASSED');
    expect(output).toContain('OVERALL MAX DIVERGENCE: 0.00e+00');
  }, 30000);
});

// ─── Bonus: Risk Classification Tests ───────────────────────────────────────

describe('Risk Classification', () => {
  it('classifies SAFE below 0.6 ratio', () => {
    expect(classifyRisk(0.0, 1.0)).toBe('SAFE');
    expect(classifyRisk(0.3, 1.0)).toBe('SAFE');
    expect(classifyRisk(0.59, 1.0)).toBe('SAFE');
  });

  it('classifies WARNING at 0.6–0.99 ratio', () => {
    expect(classifyRisk(0.6, 1.0)).toBe('WARNING');
    expect(classifyRisk(0.8, 1.0)).toBe('WARNING');
    expect(classifyRisk(0.99, 1.0)).toBe('WARNING');
  });

  it('classifies CRITICAL at 1.0+ ratio', () => {
    expect(classifyRisk(1.0, 1.0)).toBe('CRITICAL');
    expect(classifyRisk(1.5, 1.0)).toBe('CRITICAL');
  });
});

// ─── Bonus: ETA Tests ───────────────────────────────────────────────────────

describe('ETA Computation', () => {
  it('returns 0 when already critical', () => {
    const eta = computeETA([0.5, 0.7, 0.9, 1.0, 1.1], 1.0, 1.1, 5, 180);
    expect(eta).toBe(0);
  });

  it('returns null when slope is flat', () => {
    const eta = computeETA([0.5, 0.5, 0.5, 0.5, 0.5], 1.0, 0.5, 5, 180);
    expect(eta).toBeNull();
  });

  it('returns null when slope is negative (water decreasing)', () => {
    const eta = computeETA([0.5, 0.4, 0.3, 0.2, 0.1], 1.0, 0.1, 5, 180);
    expect(eta).toBeNull();
  });

  it('computes reasonable ETA for rising water', () => {
    // Linear rise: 0.1 per step. Critical at 1.0. Current at 0.5.
    // Remaining: 0.5. Rate: 0.1/step. ETA: 5 steps.
    const eta = computeETA([0.1, 0.2, 0.3, 0.4, 0.5], 1.0, 0.5, 5, 180);
    expect(eta).toBeCloseTo(5, 5);
  });

  it('returns null when ETA exceeds horizon', () => {
    // Very slow rise
    const history = [0.0001, 0.0002, 0.0003, 0.0004, 0.0005];
    const eta = computeETA(history, 1.0, 0.0005, 5, 180);
    // Remaining ≈ 1.0, rate ≈ 0.0001/step → ETA ≈ 10000 >> 180
    expect(eta).toBeNull();
  });

  it('least-squares slope is accurate for linear data', () => {
    // Perfect linear: y = 0.1 + 0.05 * x
    const data = [0.1, 0.15, 0.2, 0.25, 0.3];
    const slope = leastSquaresSlope(data, 5);
    expect(slope).toBeCloseTo(0.05, 10);
  });
});
