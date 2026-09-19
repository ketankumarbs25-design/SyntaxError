/**
 * FLOWSHIELD — Simulation CLI Exporter
 *
 * Runs the TypeScript simulation engine and outputs water depth array per step
 * in JSON format to stdout or file, for validation against Python.
 */

import { run } from './index';
import type { SimConfig } from './types';
import * as fs from 'fs';

const args = process.argv.slice(2);
let config: Partial<SimConfig> = {};
let outputFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--config' && args[i + 1]) {
    config = JSON.parse(args[i + 1]);
    i++;
  } else if (args[i] === '--output' && args[i + 1]) {
    outputFile = args[i + 1];
    i++;
  }
}

const timeline = run(config);

// Extract water array: [step][row][col]
const rows = timeline[0].cells[timeline[0].cells.length - 1].row + 1;
const cols = timeline[0].cells[timeline[0].cells.length - 1].col + 1;

const result = {
  config,
  steps: timeline.length,
  rows,
  cols,
  elevation: Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => timeline[0].cells[r * cols + c].elevation)
  ),
  water: timeline.map(state =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => state.cells[r * cols + c].water)
    )
  ),
  totalWater: timeline.map(s => s.totalWater),
};

const json = JSON.stringify(result);

if (outputFile) {
  fs.writeFileSync(outputFile, json, 'utf8');
} else {
  process.stdout.write(json);
}
