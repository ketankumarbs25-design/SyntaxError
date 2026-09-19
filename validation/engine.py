"""
FLOWSHIELD — Python NumPy Simulation Engine

Exact mathematical reimplementation of the TypeScript simulation engine:
- Mulberry32 PRNG with bit-identical 32-bit arithmetic
- Layered value noise with Hermite smoothstep and radial basin
- Explicit Euler timestep (rain -> drainage -> Jacobi flow -> clamp -> delta -> conservation)

Given the same seed and config, this engine reproduces the TypeScript output to < 1e-9.
"""

from typing import Dict, Any, Tuple
import numpy as np
import math


class Mulberry32:
    """32-bit Mulberry32 PRNG matching JavaScript bitwise operators."""

    def __init__(self, seed: int):
        self.s = seed & 0xFFFFFFFF

    def next(self) -> float:
        self.s = (self.s + 0x6D2B79F5) & 0xFFFFFFFF
        
        # Math.imul(s ^ (s >>> 15), 1 | s)
        t1 = (self.s ^ (self.s >> 15)) & 0xFFFFFFFF
        t2 = (1 | self.s) & 0xFFFFFFFF
        t = (t1 * t2) & 0xFFFFFFFF
        
        # t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        u1 = (t ^ (t >> 7)) & 0xFFFFFFFF
        u2 = (61 | t) & 0xFFFFFFFF
        t = ((t + (u1 * u2)) & 0xFFFFFFFF) ^ t
        
        # ((t ^ (t >>> 14)) >>> 0) / 4294967296
        res = ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0
        return float(res)


def smoothstep(t: float) -> float:
    return t * t * (3.0 - 2.0 * t)


def sample_noise(x: float, y: float, lattice: np.ndarray) -> float:
    ix = math.floor(x)
    iy = math.floor(y)
    fx = smoothstep(x - ix)
    fy = smoothstep(y - iy)

    v00 = lattice[iy, ix]
    v10 = lattice[iy, ix + 1]
    v01 = lattice[iy + 1, ix]
    v11 = lattice[iy + 1, ix + 1]

    top = v00 + (v10 - v00) * fx
    bot = v01 + (v11 - v01) * fx
    return top + (bot - top) * fy


def build_lattice(size: int, rng: Mulberry32) -> np.ndarray:
    lat = np.zeros((size + 1, size + 1), dtype=np.float64)
    for i in range(size + 1):
        for j in range(size + 1):
            lat[i, j] = rng.next()
    return lat


def terrain_elevation(
    row: int,
    col: int,
    rows: int,
    cols: int,
    lattices: list,
) -> float:
    nx = col / (cols - 1 if cols > 1 else 1)
    ny = row / (rows - 1 if rows > 1 else 1)

    frequencies = [1, 2, 4]
    amplitudes = [0.5, 0.3, 0.2]
    elevation = 0.0

    for o in range(3):
        freq = frequencies[o]
        sx = nx * freq
        sy = ny * freq
        elevation += sample_noise(sx, sy, lattices[o]) * amplitudes[o]

    cx = nx - 0.5
    cy = ny - 0.5
    dist_sq = cx * cx + cy * cy
    basin = dist_sq * 1.2

    elevation = elevation * 0.6 + basin * 0.4
    return float(np.clip(elevation, 0.0, 1.0))


def create_grid(config: Dict[str, Any]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate initial grid parameters.
    Returns:
        elevation: (rows, cols) float64
        drainage_rate: (rows, cols) float64
        water: (rows, cols) float64
    """
    rows = config.get("rows", 8)
    cols = config.get("cols", 8)
    seed = config.get("seed", 42)
    elevation_mult = config.get("elevationMultiplier", 1.0)
    initial_water = config.get("initialWater", 0.0)

    rng = Mulberry32(seed)
    lattices = [
        build_lattice(6, rng),
        build_lattice(10, rng),
        build_lattice(18, rng),
    ]

    elevation = np.zeros((rows, cols), dtype=np.float64)
    drainage_rate = np.zeros((rows, cols), dtype=np.float64)
    water = np.full((rows, cols), initial_water, dtype=np.float64)

    for r in range(rows):
        for c in range(cols):
            raw_elev = terrain_elevation(r, c, rows, cols, lattices)
            elev = raw_elev * elevation_mult
            pop_factor = 1.0 - raw_elev
            pop_noise = 0.5 + rng.next() * 0.5
            _pop = round(100 + pop_factor * pop_noise * 4900)
            _crit = 0.3 + (1.0 - pop_factor) * 0.4 + rng.next() * 0.1
            d_rate = 0.001 + raw_elev * 0.002 + rng.next() * 0.0005
            _cap = 0.05 + raw_elev * 0.1 + rng.next() * 0.02

            elevation[r, c] = elev
            drainage_rate[r, c] = d_rate

    return elevation, drainage_rate, water


def step(
    water: np.ndarray,
    elevation: np.ndarray,
    drainage_rate: np.ndarray,
    current_time: float,
    config: Dict[str, Any],
) -> Tuple[np.ndarray, float]:
    """
    Execute one simulation timestep using NumPy.
    Returns:
        new_water: (rows, cols) float64
        actual_water_delta: float
    """
    rows, cols = water.shape
    dt = config.get("dt", 1.0)
    rainfall_intensity = config.get("rainfallIntensity", 80.0)
    rainfall_duration = config.get("rainfallDuration", 90.0)
    drainage_efficiency = config.get("drainageEfficiency", 1.0)
    flow_coeff = config.get("flowCoefficient", 0.15)
    safety_factor = config.get("safetyFactor", 0.5)

    prev_water = np.copy(water)
    working_water = np.copy(water)

    # 1. Rainfall
    is_raining = current_time < rainfall_duration
    rain_per_step = (rainfall_intensity / 60.0) * dt / 1000.0 if is_raining else 0.0
    total_rain = 0.0
    if rain_per_step > 0.0:
        working_water += rain_per_step
        total_rain = rain_per_step * (rows * cols)

    # 2. Infiltration / Drainage
    max_drain = drainage_rate * (drainage_efficiency * dt)
    drained = np.minimum(working_water, max_drain)
    working_water -= drained
    total_drained = float(np.sum(drained))

    # 3. Inter-cell flow (Jacobi, 4-neighbour)
    flow_delta = np.zeros((rows, cols), dtype=np.float64)
    neighbours = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    for r in range(rows):
        for c in range(cols):
            head_i = elevation[r, c] + working_water[r, c]
            outflows = []
            total_outflow = 0.0

            for dr, dc in neighbours:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    head_j = elevation[nr, nc] + working_water[nr, nc]
                    if head_i > head_j:
                        drop = head_i - head_j
                        q = flow_coeff * drop * dt
                        outflows.append((nr, nc, q))
                        total_outflow += q

            max_outflow = working_water[r, c] * safety_factor
            scale = 1.0
            if total_outflow > max_outflow and total_outflow > 0.0:
                scale = max_outflow / total_outflow

            for nr, nc, q in outflows:
                actual_q = q * scale
                flow_delta[r, c] -= actual_q
                flow_delta[nr, nc] += actual_q

    # 4. Apply deltas, clamp water >= 0
    new_water = np.maximum(0.0, working_water + flow_delta)

    # 5. Assert global conservation
    water_prev_sum = float(np.sum(prev_water))
    water_new_sum = float(np.sum(new_water))
    water_delta = water_new_sum - water_prev_sum
    expected = total_rain - total_drained
    conservation_error = abs(expected - water_delta)

    if conservation_error > 1e-9:
        raise ValueError(
            f"Conservation violated in Python engine: |{expected:.4e} - {water_delta:.4e}| = {conservation_error:.4e} > 1e-9"
        )

    return new_water, water_delta


def run_simulation(config: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """Run full simulation and return water array across all timesteps."""
    if config is None:
        config = {}

    rows = config.get("rows", 8)
    cols = config.get("cols", 8)
    rainfall_duration = config.get("rainfallDuration", 90.0)
    dt = config.get("dt", 1.0)

    elevation, drainage_rate, initial_water = create_grid(config)

    total_steps = int(math.ceil(rainfall_duration * 1.5))
    timeline_water = [np.copy(initial_water)]
    current_water = np.copy(initial_water)
    current_time = 0.0

    for _step in range(total_steps):
        current_water, _ = step(
            current_water,
            elevation,
            drainage_rate,
            current_time,
            config,
        )
        current_time += dt
        timeline_water.append(np.copy(current_water))

    water_tensor = np.stack(timeline_water, axis=0)  # (timesteps, rows, cols)
    total_water = [float(np.sum(w)) for w in timeline_water]

    # Calculate affected population across timesteps (Warning + Critical cells)
    # Critical threshold: 0.30m (or ratio >= 1.0), Warning threshold: 0.15m
    affected_pop_timeline = []
    # Base cell populations
    cell_pop = np.zeros((rows, cols), dtype=np.int32)
    rng_stats = Mulberry32(config.get("seed", 42))
    lattices_stats = [build_lattice(6, rng_stats), build_lattice(10, rng_stats), build_lattice(18, rng_stats)]
    for r in range(rows):
        for c in range(cols):
            raw_elev = terrain_elevation(r, c, rows, cols, lattices_stats)
            pop_factor = 1.0 - raw_elev
            pop_noise = 0.5 + rng_stats.next() * 0.5
            cell_pop[r, c] = round(100 + pop_factor * pop_noise * 4900)
            rng_stats.next()  # match PRNG calls: _crit, d_rate, _cap
            rng_stats.next()
            rng_stats.next()

    for w_step in timeline_water:
        # Warning (>= 0.15m) or Critical (>= 0.30m)
        is_affected = w_step >= 0.15
        step_affected_pop = int(np.sum(cell_pop[is_affected]))
        affected_pop_timeline.append(step_affected_pop)

    return {
        "steps": len(timeline_water),
        "rows": rows,
        "cols": cols,
        "elevation": elevation.tolist(),
        "water": water_tensor.tolist(),
        "totalWater": total_water,
        "affectedPopulation": affected_pop_timeline,
        "peakAffectedPopulation": max(affected_pop_timeline) if affected_pop_timeline else 0,
    }

