# FLOWSHIELD

> **Deterministic Hydrodynamic Flood Telemetry & Early Warning Engine**  
> *Real-time cellular inundation forecasting with 2D Jacobi flow, least-squares ETA regression, Web Worker acceleration, and Python NumPy mathematical cross-validation.*

---

## 1. Problem Statement

Hydrological flood forecasting in urban catchments and low-lying floodplains typically faces an operational trade-off:
- **Traditional 2D Shallow Water Equation (SWE) solvers** (e.g., HEC-RAS 2D, TUFLOW, Telemac-2D) solve full Saint-Venant momentum and continuity equations. While hydrodynamic fidelity is high, compute latency is prohibitive for instant interactive exploration, scenario stress-testing, and zero-latency timeline scrubbing on standard client hardware.
- **Simplified GIS / bathtub static fill models** ignore physical flow pathways, gravity head gradients, drainage bottlenecks, and inter-cell mass conservation, producing inaccurate flood extents and zero dynamic velocity information.

**FLOWSHIELD** bridges this gap. It implements a **deterministic 2D cellular hydrodynamic explicit Euler engine** operating on a discrete terrain lattice. The engine simulates precipitation, infiltration, and gravity-driven hydraulic head diffusion in pure TypeScript inside a Web Worker, precomputing the entire trajectory for instant bidirectional timeline scrubbing.

---

## 2. System Architecture

```
                                  FLOWSHIELD ARCHITECTURE
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │                                     MAIN THREAD (UI)                                    │
 │                                                                                         │
 │   ┌──────────────────────┐  ┌───────────────────────────────┐  ┌─────────────────────┐  │
 │   │ Meteorological       │  │ Tactical Command Center       │  │ Early Warnings      │  │
 │   │ Controls             │  │ - 8×8 CSS Grid Heatmap        │  │ - Sorted by ETA     │  │
 │   │ - Rain Rate (mm/hr)  │  │   (180ms CSS Transitions)     │  │ - AnimatePresence   │  │
 │   │ - Storm Duration     │  │ - Decoupled rAF Clock (10 Hz) │  │ - Interactive Zone  │  │
 │   │ - Drainage Eff.      │  │ - Instant Slider Scrubbing    │  │   Selection         │  │
 │   │ - Topographic Relief │  │ - Live Analytical Recharts    │  ├─────────────────────┤  │
 │   │ - Stress Scenarios   │  │ - Tactical Sector Modal       │  │ Scenario Comparison │  │
 │   │ - 90s Narrated Demo  │  │ - Ambient KokonutUI Backdrop  │  │ - Normal/Heavy/Ext  │  │
 │   └──────────┬───────────┘  └───────────────▲───────────────┘  │ - Animated Bars     │  │
 │              │                              │                  └─────────────────────┘  │
 └──────────────┼──────────────────────────────┼───────────────────────────────────────────┘
                │ PostMessage                  │ Timeline / Scenarios
                ▼                              │
 ┌─────────────────────────────────────────────┴───────────────────────────────────────────┐
 │                                   WEB WORKER THREAD                                     │
 │                                                                                         │
 │   ┌────────────────────────┐  ┌────────────────────────────┐  ┌─────────────────────┐  │
 │   │ Mulberry32 PRNG        │  │ 6-Phase Explicit Euler     │  │ Statistical Derived │  │
 │   │ - Seeded deterministic │  │   Timestep (dt = 1 min)    │  │ Telemetry           │  │
 │   │ - Layered Value Noise  │  │ - Rain Mass Injection      │  │ - OLS ETA Regression│  │
 │   │ - Topographic Basin    │  │ - Infiltration Loss        │  │ - Risk Classifier   │  │
 │   │   Generator            │  │ - Jacobi Inter-Cell Flow   │  │ - Population Est.   │  │
 │   │                        │  │ - Mandatory Outflow Clamp  │  │ - Exact Mass Conserv│  │
 │   └────────────────────────┘  └────────────────────────────┘  └─────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
                                               ▲
                                               │ Exact Mathematical Identity (< 1e-9)
 ┌─────────────────────────────────────────────┴───────────────────────────────────────────┐
 │                        PYTHON NUMPY CROSS-VALIDATION HARNESS                            │
 │                        (/validation/engine.py & validate.py)                            │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Governing Equations

The simulation operates on a regular Cartesian lattice with spatial cell dimensions $\Delta x = \Delta y$. Each cell $i = (r, c)$ possesses:
- Ground elevation: $z_i \ge 0$ [m]
- Surface water depth: $w_i(t) \ge 0$ [m]
- Total hydraulic piezometric head: $h_i(t) = z_i + w_i(t)$ [m]
- Saturated drainage / infiltration capacity: $f_{0,i}$ [m/min]
- Critical inundation depth: $d_{c,i}$ [m]

At discrete timestep index $n$ with time $t = n \Delta t$ ($\Delta t = 1.0 \text{ min}$), the state evolves via six strictly sequential phases:

### Phase 1: Precipitation Mass Injection
Rainfall intensity $I$ [mm/hr] is converted to depth per timestep:
$$P(t) = \begin{cases} \dfrac{I}{60 \cdot 1000} \cdot \Delta t & \text{for } t < T_{\text{rain}} \\ 0 & \text{for } t \ge T_{\text{rain}} \end{cases} \quad [\text{metres}]$$

$$w_i^{(1)} = w_i^n + P(t)$$

### Phase 2: Infiltration & Drainage Abstraction
Ground infiltration abstracts standing surface water subject to local drainage capacity and system-wide efficiency $\eta \in [0, 1]$:
$$F_i = \min\left(w_i^{(1)},\; f_{0,i} \cdot \eta \cdot \Delta t\right)$$
$$w_i^{(2)} = w_i^{(1)} - F_i$$

### Phase 3: 2D Inter-Cell Flow (Jacobi Formulation)
Flow is computed using a **Jacobi method** evaluated entirely against the post-abstraction state $w_i^{(2)}$, preventing directional or iteration-order bias:
$$\mathcal{N}(i) = \{(r-1, c),\; (r+1, c),\; (r, c-1),\; (r, c+1)\}$$
$$h_i = z_i + w_i^{(2)}$$

For each 4-connected neighbour $j \in \mathcal{N}(i)$, flow occurs along the negative hydraulic head gradient:
$$\Delta h_{ij} = h_i - h_j$$

$$q_{ij} = \begin{cases} k \cdot \Delta h_{ij} \cdot \Delta t & \text{if } h_i > h_j \\ 0 & \text{if } h_i \le h_j \end{cases}$$
where $k$ is the kinematic flow transmissivity coefficient ($k = 0.15$).

### Phase 4: Mandatory Outflow Stability Clamp
In explicit Euler numerical schemes, unconstrained multi-directional outflow can produce negative water depths, severe grid oscillation, or head gradient inversion within a single step.

Let $S_i$ denote the candidate total outflow from cell $i$:
$$S_i = \sum_{j \in \mathcal{N}(i)} q_{ij}$$

Let $\gamma = 0.5$ denote the mandatory safety factor. The stability scaling factor $\alpha_i$ is enforced:
$$\alpha_i = \begin{cases} \dfrac{w_i^{(2)} \cdot \gamma}{S_i} & \text{if } S_i > w_i^{(2)} \cdot \gamma \\ 1.0 & \text{otherwise} \end{cases}$$

The actual mass-conservative outflow from $i$ to $j$ is:
$$q_{ij}^* = q_{ij} \cdot \alpha_i$$

### Phase 5: Net Flux Update & Conservation Invariant
The net inter-cell flux $\Delta Q_i$ is applied:
$$\Delta Q_i = \sum_{j \in \mathcal{N}(i)} q_{ji}^* - \sum_{j \in \mathcal{N}(i)} q_{ij}^*$$

$$w_i^{n+1} = \max\left(0,\; w_i^{(2)} + \Delta Q_i\right)$$

**Global Mass Conservation Assertion**:
$$\left| \sum_{i} P_i(t) - \sum_{i} F_i - \left(\sum_i w_i^{n+1} - \sum_i w_i^n\right) \right| < 10^{-9} \text{ m}$$
If the absolute residual exceeds $10^{-9}$, the engine throws an invariant violation.

---

## 4. Stability Clamp Rationale & CFL Condition

In a 2D diffusion equation $\frac{\partial w}{\partial t} = k \nabla^2 (z + w)$, the Courant–Friedrichs–Lewy (CFL) stability criterion on a 4-neighbour orthogonal stencil requires:
$$\nu = \frac{4 \cdot k \cdot \Delta t}{\Delta x^2} \le \frac{1}{2}$$

On a unit lattice ($\Delta x = 1, \Delta t = 1$), this implies $k \le 0.125$ for unconstrained convergence. However, when hydraulic drop $\Delta h$ is large (e.g. adjacent steep embankments or retaining walls), two neighbouring cells could swap water levels entirely, generating **checkerboard numerical sloshing**:
$$h_i^{n+1} - h_j^{n+1} = (h_i^n - h_j^n)(1 - 2k)$$

If $1 - 2k < 0$, the gradient inverts. FLOWSHIELD's stability clamp guarantees:
1. **Positivity**: $S_i \le 0.5 \cdot w_i \implies w_i^{n+1} \ge 0.5 \cdot w_i > 0$. A cell can never drain below 50% of its volume in a single minute.
2. **Monotonic Settling**: As verified in the test suite, a single full cell surrounded by dry cells spreads outward and monotonically settles to exact hydrostatic equilibrium without oscillation.
3. **No Upward Flow**: $q_{ij} = 0$ whenever $h_i \le h_j$. Water never moves uphill.

---

## 5. Risk Classification & OLS ETA Derivation

### Risk Classification
Risk is a continuous derived ratio, never a hardcoded state:
$$\rho_i(t) = \frac{w_i(t)}{d_{c,i}}$$

$$\text{RiskLevel}(i) = \begin{cases} \text{SAFE} & \rho_i < 0.60 \\ \text{WARNING} & 0.60 \le \rho_i < 1.00 \\ \text{CRITICAL} & \rho_i \ge 1.00 \end{cases}$$

### Least-Squares ETA to Critical Depth
Single-step deltas ($\frac{\Delta w}{\Delta t}$) fluctuate wildly due to local inter-cell turbulence. FLOWSHIELD computes the **Ordinary Least-Squares (OLS) linear regression slope** $\beta_i$ over a rolling window of the last $N = 5$ timesteps:

Let $x = \{0, 1, 2, \dots, N-1\}$ and $y_m = w_i(t - (N - 1 - m))$:
$$\beta_i = \frac{N \sum_{m=0}^{N-1} x_m y_m - \left(\sum_{m=0}^{N-1} x_m\right) \left(\sum_{m=0}^{N-1} y_m\right)}{N \sum_{m=0}^{N-1} x_m^2 - \left(\sum_{m=0}^{N-1} x_m\right)^2}$$

The Time-to-Critical ($\text{ETA}$) is derived:
$$\text{ETA}_i = \begin{cases} 0 & \text{if } w_i(t) \ge d_{c,i} \quad (\text{Already Critical}) \\ \text{null} & \text{if } \beta_i \le 10^{-6} \text{ m/min} \quad (\text{Stable or receding}) \\ \dfrac{d_{c,i} - w_i(t)}{\beta_i} & \text{if } \dfrac{d_{c,i} - w_i(t)}{\beta_i} \le T_{\text{horizon}} \\ \text{null} & \text{if } \text{ETA}_i > T_{\text{horizon}} \quad (\text{Beyond prediction horizon}) \end{cases}$$

- Recomputed dynamically at every timestep.
- When $\beta_i \le 10^{-6}$, ETA renders cleanly as `"—"`, avoiding display of absurd multi-day numbers.

---

## 6. TypeScript vs Python NumPy Cross-Validation

The repository includes a companion reference engine in `/validation/engine.py` implemented purely in Python using NumPy float64 matrices.

### PRNG Determinism
Both engines employ an exact 32-bit `Mulberry32` PRNG matching JavaScript bitwise operators (`>>>`, `|`, `^`, `Math.imul`):
- Seed 42 produces byte-for-byte identical float64 sequences in both TypeScript and Python.

### Cross-Validation Test Matrix
The cross-validation harness (`/validation/validate.py`) executes both engines on multiple scenarios and measures the maximum absolute divergence:
$$\varepsilon_{\max} = \max_{t, r, c} |w_{\text{TS}}(t, r, c) - w_{\text{Py}}(t, r, c)|$$

| Test Scenario | Grid | Seed | Duration | Data Points | Max Divergence | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Standard Heavy Rain** | 8×8 | 42 | 90 min | 5,824 | **0.00e+00** | **PASSED** (< 1e-9) |
| **Extreme Rain + Low Drainage** | 6×6 | 999 | 67 min | 2,484 | **0.00e+00** | **PASSED** (< 1e-9) |
| **No Drainage (Conservation)** | 6×6 | 777 | 45 min | 1,656 | **0.00e+00** | **PASSED** (< 1e-9) |

---

## 7. How to Run

### Prerequisites
- Node.js $\ge 20$ (LTS recommended)
- Python 3.10+ with `numpy`

### 1. Install Dependencies
```bash
npm install
py -3.14 -m pip install numpy    # or: pip install numpy
```

### 2. Run Test Suite (Vitest)
Executes all 17 automated tests, including mass conservation, symmetry, settling, monotonicity, and Python cross-validation:
```bash
npx vitest run
```

### 3. Run Standalone Python Cross-Validation
```bash
py -3.14 validation/validate.py  # or: python validation/validate.py
```

### 4. Start Tactical Control Center (Development Server)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 8. Honest Limitations & Physical Assumptions

While FLOWSHIELD provides high-performance deterministic simulations and instant scrubbing, users and researchers should be aware of several deliberate simplifications:

1. **No Manning Roughness / Momentum Formulation**: Flow velocity is modeled via linear hydrostatic gradient diffusion ($q \propto \Delta h$), rather than the non-linear Manning–Strickler friction equation ($V = \frac{1}{n} R^{2/3} S^{1/2}$). Inertial waves and supercritical hydraulic jumps are not modeled.
2. **Procedural Layered Value Noise vs. LiDAR DEM**: Elevation is synthesized deterministically using a 3-octave Hermite value noise generator with a radial depression basin. Real-world catchments require importing GeoTIFF digital elevation models (DEMs).
3. **Linear Drainage vs. Saturated Soil Dynamics**: Infiltration is modeled as a linear rate abstraction ($f \cdot \eta$). Real catchments exhibit dynamic wetting fronts and non-linear infiltration decay as described by Horton or Green-Ampt formulations.
4. **4-Neighbour Orthogonal Stencil (Anisotropic Diagonal Bias)**: Flow is evaluated on a 4-connected cross stencil (von Neumann neighborhood). On flat surfaces, diagonal dispersion spreads via a Manhattan metric, slightly underestimating true circular diagonal diffusion compared to an 8-neighbour (Moore) or triangular unstructured mesh.

---

## 9. License

MIT License — free for educational, research, and production simulation use.
