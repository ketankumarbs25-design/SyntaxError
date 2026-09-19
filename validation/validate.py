"""
FLOWSHIELD — Cross-Validation Script (TypeScript vs Python NumPy)

Runs both the TypeScript and Python engines with identical seeds and configurations,
diffs every cell at every timestep, and verifies maximum absolute divergence < 1e-9.
"""

import sys
import os
import json
import subprocess
import numpy as np

# Add validation directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine import run_simulation


def main():
    print("=" * 60)
    print("FLOWSHIELD — TS vs Python NumPy Cross-Validation Harness")
    print("=" * 60)

    # Test configurations to validate across multiple seeds and conditions
    test_configs = [
        {
            "name": "Standard Heavy Rain (Default)",
            "config": {
                "rows": 8,
                "cols": 8,
                "seed": 42,
                "rainfallIntensity": 80,
                "rainfallDuration": 60,
                "drainageEfficiency": 1.0,
                "flowCoefficient": 0.15,
                "elevationMultiplier": 1.0,
                "initialWater": 0.0,
                "safetyFactor": 0.5,
                "dt": 1.0,
            },
        },
        {
            "name": "Extreme Rain + Low Drainage",
            "config": {
                "rows": 6,
                "cols": 6,
                "seed": 999,
                "rainfallIntensity": 160,
                "rainfallDuration": 45,
                "drainageEfficiency": 0.2,
                "flowCoefficient": 0.15,
                "elevationMultiplier": 1.5,
                "initialWater": 0.05,
                "safetyFactor": 0.5,
                "dt": 1.0,
            },
        },
        {
            "name": "No Drainage (Pure Mass Conservation)",
            "config": {
                "rows": 6,
                "cols": 6,
                "seed": 777,
                "rainfallIntensity": 50,
                "rainfallDuration": 30,
                "drainageEfficiency": 0.0,
                "flowCoefficient": 0.15,
                "elevationMultiplier": 0.8,
                "initialWater": 0.0,
                "safetyFactor": 0.5,
                "dt": 1.0,
            },
        },
    ]

    all_passed = True
    overall_max_diff = 0.0

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    for test in test_configs:
        name = test["name"]
        cfg = test["config"]
        print(f"\n[TEST] {name}")
        print(f"       Grid: {cfg['rows']}x{cfg['cols']}, Seed: {cfg['seed']}, Rain: {cfg['rainfallIntensity']}mm/hr, Steps: {int(cfg['rainfallDuration'] * 1.5)}")

        # 1. Run TS engine via CLI
        config_json = json.dumps(cfg)
        cmd = ["npx", "tsx", "src/sim/cli.ts", "--config", config_json]
        
        # On Windows, need shell=True for npx
        proc = subprocess.run(
            cmd,
            cwd=project_root,
            capture_output=True,
            text=True,
            shell=True,
        )

        if proc.returncode != 0:
            print(f"❌ TS engine execution failed (code {proc.returncode}):")
            print(proc.stderr)
            all_passed = False
            continue

        try:
            ts_data = json.loads(proc.stdout)
        except Exception as e:
            print(f"❌ Failed to parse TS output: {e}")
            print(f"Stdout was: {proc.stdout[:200]}...")
            all_passed = False
            continue

        # 2. Run Python engine
        py_data = run_simulation(cfg)

        # 3. Diff elevation
        ts_elev = np.array(ts_data["elevation"], dtype=np.float64)
        py_elev = np.array(py_data["elevation"], dtype=np.float64)
        elev_diff = np.max(np.abs(ts_elev - py_elev))

        # 4. Diff water across all steps and cells
        ts_water = np.array(ts_data["water"], dtype=np.float64)
        py_water = np.array(py_data["water"], dtype=np.float64)

        if ts_water.shape != py_water.shape:
            print(f"❌ Shape mismatch! TS: {ts_water.shape}, Py: {py_water.shape}")
            all_passed = False
            continue

        water_diff = np.max(np.abs(ts_water - py_water))
        overall_max_diff = max(overall_max_diff, float(water_diff))

        print(f"       Max Elevation Diff : {elev_diff:.2e}")
        print(f"       Max Water Diff     : {water_diff:.2e}")
        print(f"       Total Timesteps    : {ts_water.shape[0]}")
        print(f"       Total Data Points  : {ts_water.size}")

        if water_diff < 1e-9 and elev_diff < 1e-9:
            print("       STATUS: PASSED (< 1e-9)")
        else:
            print(f"       STATUS: FAILED (water diff {water_diff:.2e} >= 1e-9)")
            all_passed = False

    print("\n" + "=" * 60)
    print(f"OVERALL MAX DIVERGENCE: {overall_max_diff:.2e}")
    if all_passed and overall_max_diff < 1e-9:
        print("RESULT: ALL TESTS PASSED! TS and Python engines match to < 1e-9.")
        print("=" * 60)
        sys.exit(0)
    else:
        print("RESULT: VALIDATION FAILED!")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
