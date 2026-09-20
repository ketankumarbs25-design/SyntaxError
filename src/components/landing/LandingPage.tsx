/**
 * FLOWSHIELD — Landing Page
 * Design: Dark-tech / serious B2B for emergency managers & developers
 * Dials: DESIGN_VARIANCE:7 | MOTION_INTENSITY:5 | VISUAL_DENSITY:5
 * Stack: Tailwind v4, motion/react, lucide-react (existing dep), CSS tokens
 */

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from 'motion/react';
import {
  Shield,
  Zap,
  Activity,
  GitBranch,
  Terminal,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import heroImg from '../../assets/flowshield_hero.jpg';
import engineImg from '../../assets/flowshield_engine_preview.jpg';

/* ─── Tiny utility: fade + slide in on scroll ─────────────────────────────── */
function FadeIn({
  children,
  delay = 0,
  className = '',
  from = 'bottom',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: 'bottom' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  const initial =
    from === 'left' ? { opacity: 0, x: -32 } : from === 'right' ? { opacity: 0, x: 32 } : { opacity: 0, y: 24 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Metric chip (hero area) ─────────────────────────────────────────────── */
function MetricChip({ label, value, status }: { label: string; value: string; status: 'safe' | 'warn' | 'crit' | 'accent' }) {
  const colorMap = {
    safe: 'var(--status-safe)',
    warn: 'var(--status-warn)',
    crit: 'var(--status-crit)',
    accent: 'var(--accent)',
  };
  const bgMap = {
    safe: 'var(--status-safe-subtle)',
    warn: 'var(--status-warn-subtle)',
    crit: 'var(--status-crit-subtle)',
    accent: 'var(--accent-subtle)',
  };
  const borderMap = {
    safe: 'var(--status-safe-border)',
    warn: 'var(--status-warn-border)',
    crit: 'var(--status-crit-border)',
    accent: 'var(--accent-border)',
  };
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono"
      style={{
        background: bgMap[status],
        border: `1px solid ${borderMap[status]}`,
        color: colorMap[status],
      }}
    >
      <span className="font-bold tabular-nums">{value}</span>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

/* ─── Bento feature card ──────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  body,
  accent = false,
  tall = false,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  accent?: boolean;
  tall?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 flex flex-col gap-3 transition-colors duration-200 ${tall ? 'row-span-2' : ''}`}
      style={{
        background: accent ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
        border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border-strong)'}`,
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: accent ? 'var(--accent-border)' : 'var(--bg-hover)',
          color: accent ? 'var(--accent)' : 'var(--text-secondary)',
        }}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {body}
        </p>
      </div>
    </div>
  );
}

/* ─── Validation row ─────────────────────────────────────────────────────── */
function ValidationRow({
  scenario,
  grid,
  seed,
  duration,
  points,
  divergence,
}: {
  scenario: string;
  grid: string;
  seed: number;
  duration: string;
  points: string;
  divergence: string;
}) {
  return (
    <div
      className="grid text-xs font-mono py-3 gap-3 border-t"
      style={{
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-secondary)',
      }}
    >
      <span style={{ color: 'var(--text-primary)' }}>{scenario}</span>
      <span>{grid}</span>
      <span>{seed}</span>
      <span>{duration}</span>
      <span>{points}</span>
      <span className="flex items-center gap-1.5">
        <CheckCircle size={12} color="var(--status-safe)" />
        <span style={{ color: 'var(--status-safe)' }}>{divergence}</span>
      </span>
    </div>
  );
}

/* ─── Main Landing Page ─────────────────────────────────────────────────── */
export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroParallax = useTransform(scrollYProgress, [0, 0.4], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / 40);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / 40);
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10"
        style={{
          height: '64px',
          background: 'var(--header-bg)',
          borderBottom: '1px solid var(--header-border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 0 14px rgba(98,122,235,0.4)' }}
          >
            <Shield size={14} strokeWidth={2} color="#fff" />
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            FLOWSHIELD
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent)',
            }}
          >
            v1.0
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          <a href="#engine" className="hover:text-white transition-colors duration-150">Engine</a>
          <a href="#validation" className="hover:text-white transition-colors duration-150">Validation</a>
          <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
        </nav>

        {/* CTA */}
        <button
          id="nav-launch-cta"
          onClick={onEnter}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Launch Command Center
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[100dvh] grid md:grid-cols-2 pt-16"
        onMouseMove={handleMouseMove}
      >
        {/* Left — copy */}
        <div className="flex flex-col justify-center px-6 md:px-16 py-16 md:py-0 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow */}
            <p
              className="text-[11px] font-mono uppercase tracking-[0.18em] mb-5"
              style={{ color: 'var(--accent)' }}
            >
              Hydrodynamic Early Warning Engine
            </p>

            {/* Headline */}
            <h1
              className="text-4xl md:text-[52px] font-bold tracking-tight leading-[1.05] mb-5"
              style={{ color: 'var(--text-primary)' }}
            >
              Deterministic flood
              <br />
              forecasting at
              <br />
              <span style={{ color: 'var(--accent)' }}>zero&nbsp;latency.</span>
            </h1>

            {/* Subtext */}
            <p
              className="text-base leading-relaxed mb-8 max-w-[44ch]"
              style={{ color: 'var(--text-secondary)' }}
            >
              2D Jacobi hydrodynamic simulation, Mulberry32 determinism, OLS ETA regression —
              verified byte-for-byte against Python NumPy.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <button
                id="hero-primary-cta"
                onClick={onEnter}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-150 active:-translate-y-px"
                style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 0 24px rgba(98,122,235,0.35)' }}
              >
                Open Command Center
                <ChevronRight size={15} strokeWidth={2} />
              </button>
              <a
                href="https://github.com/ketankumarbs25-design/SyntaxError"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-150 active:-translate-y-px"
                style={{
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                }}
              >
                View on GitHub
                <ExternalLink size={13} strokeWidth={1.5} />
              </a>
            </div>

            {/* Live metric chips */}
            <div className="flex flex-wrap gap-2">
              <MetricChip value="< 1e-9" label="max divergence" status="safe" />
              <MetricChip value="17 tests" label="all passing" status="safe" />
              <MetricChip value="10 Hz" label="playback" status="accent" />
              <MetricChip value="Web Worker" label="off-thread" status="accent" />
            </div>
          </motion.div>
        </div>

        {/* Right — hero image with parallax */}
        <div className="relative overflow-hidden min-h-[50dvh] md:min-h-0">
          <motion.div
            className="absolute inset-0"
            style={{ y: heroParallax, rotateX: springY, rotateY: springX, transformStyle: 'preserve-3d' }}
          >
            <img
              src={heroImg}
              alt="Aerial view of flooded city with FLOWSHIELD tactical grid overlay"
              className="w-full h-full object-cover"
            />
            {/* Dark gradient left-fade to blend with copy column */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, var(--bg-base) 0%, transparent 30%)',
              }}
            />
            {/* Bottom fade */}
            <div
              className="absolute inset-x-0 bottom-0 h-32"
              style={{ background: 'linear-gradient(to top, var(--bg-base), transparent)' }}
            />
          </motion.div>

          {/* Floating status card overlay */}
          <motion.div
            className="absolute bottom-8 right-6 rounded-xl p-4 w-52 hidden md:block"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-strong)',
              backdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--status-crit)' }} />
              <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--status-crit)' }}>
                Critical Alert
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
              Sector B3 — depth 0.94m
            </p>
            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              ETA critical: <span style={{ color: 'var(--status-warn)' }}>4 min</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ENGINE SECTION ─────────────────────────────────────────────────── */}
      <section id="engine" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <FadeIn from="left">
            <div className="relative rounded-xl overflow-hidden aspect-[3/2]"
              style={{ border: '1px solid var(--border-strong)' }}>
              <img
                src={engineImg}
                alt="FLOWSHIELD tactical simulation interface showing 8x8 flood heatmap grid"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(98,122,235,0.08) 0%, transparent 60%)' }}
              />
            </div>
          </FadeIn>

          {/* Copy */}
          <FadeIn from="right" delay={0.1}>
            <p
              className="text-[11px] font-mono uppercase tracking-[0.18em] mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Simulation Engine
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5"
              style={{ color: 'var(--text-primary)' }}>
              6-phase explicit Euler.<br />
              Zero numerical drift.
            </h2>
            <p className="text-sm leading-relaxed mb-8 max-w-[44ch]"
              style={{ color: 'var(--text-secondary)' }}>
              Precipitation injection, Horton infiltration, 2D Jacobi inter-cell flow,
              stability clamping, net flux update, and mass conservation assertion —
              all inside a Web Worker, precomputed for instant timeline scrubbing.
            </p>

            {/* Phase list */}
            <div className="space-y-2">
              {[
                ['Phase 1', 'Rain mass injection (I mm/hr → depth/Δt)'],
                ['Phase 2', 'Infiltration abstraction (η × f₀ × Δt)'],
                ['Phase 3', '2D Jacobi inter-cell flow (k=0.15)'],
                ['Phase 4', 'Stability clamp (γ=0.5, prevents −water)'],
                ['Phase 5', 'Net flux update & conservation assertion'],
                ['Phase 6', 'OLS ETA regression over 5-step window'],
              ].map(([phase, desc]) => (
                <div key={phase} className="flex items-start gap-3 py-2 border-t"
                  style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] font-mono mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--accent)' }}>{phase}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── BENTO FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)' }}>
            Full-stack flood intelligence.
          </h2>
          <p className="text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
            From raw rainfall parameters to live AI advisory — every layer handled.
          </p>
        </FadeIn>

        {/* Bento grid: 3 cols, mixed heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wide card — spans 2 cols */}
          <FadeIn delay={0} className="md:col-span-2">
            <div
              className="rounded-xl p-6 h-full flex flex-col gap-4"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}>
                  <Activity size={18} strokeWidth={1.5} color="var(--accent)" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Real-time Gemini AI Advisory
                </p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Natural-language flood intelligence via Gemini 3.6 Flash function calling. Ask about current depths,
                safe zones, drainage status — or issue simulation commands: "Set rainfall to 120 mm/hr", "Inspect zone A1".
              </p>
              {/* Fake terminal snippet — text, not div-drawing */}
              <div
                className="rounded-lg p-3 font-mono text-[11px] leading-5"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{'>'} </span>
                <span style={{ color: 'var(--status-warn)' }}>Simulate extreme storm</span>
                <br />
                <span style={{ color: 'var(--text-muted)' }}>{'>'} </span>
                <span style={{ color: 'var(--status-safe)' }}>Sector B3 ETA: 4 min. Evacuate now.</span>
              </div>
            </div>
          </FadeIn>

          {/* Tall narrow card — spans 1 col */}
          <FadeIn delay={0.05}>
            <FeatureCard
              icon={Shield}
              title="Mass-conservative Jacobi flow"
              body="Every timestep verifies |ΣP − ΣF − Δw| < 1e-9 m. A single violated assertion throws before any render."
              accent
            />
          </FadeIn>

          {/* Normal cards row 2 */}
          <FadeIn delay={0.1}>
            <FeatureCard
              icon={Zap}
              title="Web Worker acceleration"
              body="Entire trajectory precomputed off-thread. Instant bidirectional timeline scrubbing with no UI jank."
            />
          </FadeIn>

          <FadeIn delay={0.13}>
            <FeatureCard
              icon={Terminal}
              title="Python NumPy cross-validation"
              body="Mulberry32 PRNG produces byte-identical float64 sequences in TS and Python. Max divergence: 0.00e+00."
            />
          </FadeIn>

          <FadeIn delay={0.16}>
            <FeatureCard
              icon={Clock}
              title="OLS ETA regression"
              body="Rolling 5-step least-squares linear regression per cell. Time-to-critical computed every minute, never hardcoded."
            />
          </FadeIn>

          {/* Full-width card */}
          <FadeIn delay={0.19} className="md:col-span-3">
            <div
              className="rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-hover)' }}>
                  <GitBranch size={18} strokeWidth={1.5} color="var(--text-secondary)" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  OpenWeatherMap Live Ingestion
                </p>
              </div>
              <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                Live temperature, humidity, wind, barometric pressure, AQI breakdown (PM2.5, PM10, O₃, NO₂),
                and 3-hour precipitation forecast. One-click "Simulate This Weather" injects live rainfall
                directly into the hydrodynamic engine.
              </p>
              <div className="flex gap-2 flex-wrap flex-shrink-0">
                {['AQI', 'PM2.5', 'Wind', 'Pressure', 'Forecast'].map(tag => (
                  <span key={tag}
                    className="text-[10px] font-mono px-2 py-1 rounded"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── VALIDATION TABLE ───────────────────────────────────────────────── */}
      <section id="validation" className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <FadeIn>
          <div className="rounded-xl p-8"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--status-safe-subtle)', border: '1px solid var(--status-safe-border)' }}>
                <CheckCircle size={18} strokeWidth={1.5} color="var(--status-safe)" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                  Cross-validation: 3 of 3 passed
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  TypeScript vs Python NumPy — max absolute divergence across all cells and timesteps.
                </p>
              </div>
            </div>

            {/* Column headers */}
            <div
              className="grid text-[10px] font-mono uppercase tracking-wider pb-2 gap-3"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                color: 'var(--text-muted)',
              }}
            >
              <span>Scenario</span>
              <span>Grid</span>
              <span>Seed</span>
              <span>Duration</span>
              <span>Data pts</span>
              <span>Max divergence</span>
            </div>

            <ValidationRow scenario="Standard Heavy Rain" grid="8×8" seed={42} duration="90 min" points="5,824" divergence="0.00e+00" />
            <ValidationRow scenario="Extreme Rain + Low Drainage" grid="6×6" seed={999} duration="67 min" points="2,484" divergence="0.00e+00" />
            <ValidationRow scenario="No Drainage (Conservation)" grid="6×6" seed={777} duration="45 min" points="1,656" divergence="0.00e+00" />
          </div>
        </FadeIn>
      </section>

      {/* ── LIMITATIONS STRIP ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
        <FadeIn>
          <div className="rounded-xl p-6 flex items-start gap-4"
            style={{
              background: 'var(--status-warn-subtle)',
              border: '1px solid var(--status-warn-border)',
            }}>
            <AlertTriangle size={18} strokeWidth={1.5} color="var(--status-warn)" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--status-warn)' }}>
                Deliberate simplifications — honest model
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Linear head-gradient diffusion (no Manning–Strickler). Procedural value-noise terrain (no LiDAR DEM).
                Linear drainage (no Horton/Green-Ampt wetting fronts). 4-neighbour orthogonal stencil.
                Designed for interactive scenario exploration, not certified hydraulic modelling.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(98,122,235,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-24 text-center">
          <FadeIn>
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] mb-4"
              style={{ color: 'var(--accent)' }}>
              Tactical Command Center
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5"
              style={{ color: 'var(--text-primary)' }}>
              Run your first simulation.
            </h2>
            <p className="text-base mb-8 max-w-[40ch] mx-auto"
              style={{ color: 'var(--text-secondary)' }}>
              Configure rainfall, terrain, drainage — and watch the hydrodynamic engine compute in real time.
            </p>
            <button
              id="footer-launch-cta"
              onClick={onEnter}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-150 active:scale-[0.98] active:-translate-y-px"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                boxShadow: '0 0 40px rgba(98,122,235,0.4)',
              }}
            >
              Open Command Center
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        className="border-t px-6 md:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center gap-2">
          <Shield size={12} strokeWidth={1.5} color="var(--accent)" />
          <span>FLOWSHIELD — MIT License</span>
        </div>
        <span>Hack-a-Matics 24h · Pentagram × BMSCE IEEE Computer Society</span>
        <span>Deterministic · Mass-conservative · Cross-validated</span>
      </footer>
    </div>
  );
}
