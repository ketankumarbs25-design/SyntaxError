/**
 * FLOWSHIELD — Web Worker
 *
 * Runs all heavy simulation workloads off the main thread:
 * 1. Full timeline precomputation for instantaneous scrubbing
 * 2. Headless scenario comparison runs (Normal 20 / Heavy 80 / Extreme 160)
 * 3. Custom scenario runs (e.g. Blocked Channel with drainageRate = 0)
 *
 * PURE TYPESCRIPT — Zero React, zero Motion, zero UI imports.
 */

import { run, createGrid, step, DEFAULT_CONFIG } from '../sim/index';
import type { SimConfig, SimState, CellState } from '../sim/types';
import { classifyRisk } from '../sim/risk';

export interface WorkerMessageRequest {
  id: string;
  type: 'RUN_SIMULATION' | 'RUN_SCENARIOS' | 'RUN_BLOCKED_CHANNEL';
  config?: Partial<SimConfig>;
  blockedCell?: { row: number; col: number };
}

export interface ScenarioResult {
  name: 'Normal' | 'Heavy' | 'Drainage Failure' | 'Blocked Channel';
  rainfallIntensity: number;
  drainageEfficiency: number;
  isBlocked?: boolean;
  peakLevel: number;
  maxCriticalCount: number;
  timeToFirstCritical: number | null;
  peakAffectedArea: number;
  peakAffectedPopulation: number;
  timeline: SimState[];
}

export interface ScenariosSummary {
  normal: ScenarioResult;
  heavy: ScenarioResult;
  failure: ScenarioResult;
  blocked: ScenarioResult;
}

export interface WorkerMessageResponse {
  id: string;
  type: 'SIMULATION_COMPLETE' | 'SCENARIOS_COMPLETE' | 'BLOCKED_COMPLETE' | 'ERROR';
  timeline?: SimState[];
  scenarios?: ScenariosSummary;
  blockedCell?: { row: number; col: number };
  error?: string;
}

function computeScenarioSummary(
  name: 'Normal' | 'Heavy' | 'Drainage Failure' | 'Blocked Channel',
  intensity: number,
  drainageEfficiency: number,
  baseConfig: Partial<SimConfig>,
  blocked?: { row: number; col: number }
): ScenarioResult {
  const cfg: SimConfig = {
    ...DEFAULT_CONFIG,
    ...baseConfig,
    rainfallIntensity: intensity,
    drainageEfficiency,
  };

  const timeline = blocked ? runBlockedChannel(cfg, blocked) : run(cfg);

  let peakLevel = 0;
  let maxCriticalCount = 0;
  let timeToFirstCritical: number | null = null;
  let peakAffectedArea = 0;
  let peakAffectedPopulation = 0;

  for (const state of timeline) {
    if (state.stats.maxWater > peakLevel) peakLevel = state.stats.maxWater;
    if (state.stats.criticalCells > maxCriticalCount) maxCriticalCount = state.stats.criticalCells;
    if (state.stats.criticalCells > 0 && timeToFirstCritical === null) {
      timeToFirstCritical = state.time;
    }
    if (state.stats.affectedArea > peakAffectedArea) peakAffectedArea = state.stats.affectedArea;
    if (state.stats.affectedPopulation > peakAffectedPopulation) {
      peakAffectedPopulation = state.stats.affectedPopulation;
    }
  }

  return {
    name,
    rainfallIntensity: intensity,
    drainageEfficiency,
    isBlocked: Boolean(blocked),
    peakLevel,
    maxCriticalCount,
    timeToFirstCritical,
    peakAffectedArea,
    peakAffectedPopulation,
    timeline,
  };
}

function runBlockedChannel(
  baseConfig: Partial<SimConfig>,
  blocked: { row: number; col: number }
): SimState[] {
  const config: SimConfig = { ...DEFAULT_CONFIG, ...baseConfig };
  const { rows, cols, rainfallDuration } = config;
  const n = rows * cols;

  const baseCells = createGrid(config);

  // Set the clicked cell's drainageRate to 0 (completely blocked channel)
  const targetIdx = blocked.row * cols + blocked.col;
  if (baseCells[targetIdx]) {
    baseCells[targetIdx].drainageRate = 0;
  }

  const initialCells: CellState[] = baseCells.map(cell => ({
    ...cell,
    risk: classifyRisk(cell.water, cell.criticalDepth),
    eta: null,
  }));

  const waterHistory: number[][] = Array.from({ length: n }, (_, i) => [initialCells[i].water]);
  let totalWater = 0;
  for (const cell of initialCells) totalWater += cell.water;

  let safeCells = 0, warningCells = 0, criticalCells = 0;
  let maxWater = 0, affectedArea = 0, affectedPopulation = 0;
  for (const cell of initialCells) {
    if (cell.water > maxWater) maxWater = cell.water;
    switch (cell.risk) {
      case 'SAFE': safeCells++; break;
      case 'WARNING': warningCells++; affectedArea++; affectedPopulation += cell.population; break;
      case 'CRITICAL': criticalCells++; affectedArea++; affectedPopulation += cell.population; break;
    }
  }

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
      avgWater: totalWater / n,
      affectedArea,
      affectedPopulation,
      maxDepth: maxWater,
      predictedCriticalCount: 0,
      earliestCriticalTime: null,
    },
  };

  const totalSteps = Math.ceil(rainfallDuration * 1.5);
  const timeline: SimState[] = [initialState];
  let currentState = initialState;

  for (let t = 0; t < totalSteps; t++) {
    currentState = step(currentState, config, waterHistory);
    timeline.push(currentState);
  }

  return timeline;
}

self.onmessage = (event: MessageEvent<WorkerMessageRequest>) => {
  const { id, type, config = {}, blockedCell } = event.data;

  try {
    if (type === 'RUN_SIMULATION') {
      const timeline = run(config);
      const response: WorkerMessageResponse = {
        id,
        type: 'SIMULATION_COMPLETE',
        timeline,
      };
      self.postMessage(response);
    } else if (type === 'RUN_SCENARIOS') {
      const normal = computeScenarioSummary('Normal', 20, 1.0, config);
      const heavy = computeScenarioSummary('Heavy', 80, 1.0, config);
      const failure = computeScenarioSummary('Drainage Failure', 80, 0.2, config);
      // Block the lowest central drainage cell (r4c4 or custom)
      const centerRow = Math.floor((config.rows || 8) / 2);
      const centerCol = Math.floor((config.cols || 8) / 2);
      const blocked = computeScenarioSummary('Blocked Channel', 80, 1.0, config, { row: centerRow, col: centerCol });

      const response: WorkerMessageResponse = {
        id,
        type: 'SCENARIOS_COMPLETE',
        scenarios: { normal, heavy, failure, blocked },
      };
      self.postMessage(response);
    } else if (type === 'RUN_BLOCKED_CHANNEL' && blockedCell) {
      const timeline = runBlockedChannel(config, blockedCell);
      const response: WorkerMessageResponse = {
        id,
        type: 'BLOCKED_COMPLETE',
        timeline,
        blockedCell,
      };
      self.postMessage(response);
    }
  } catch (err: any) {
    const response: WorkerMessageResponse = {
      id,
      type: 'ERROR',
      error: err?.message || 'Unknown simulation error',
    };
    self.postMessage(response);
  }
};
