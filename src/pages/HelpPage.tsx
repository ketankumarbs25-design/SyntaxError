import React, { useState } from 'react';
import {
  Code2,
  Database,
  BookOpen,
  ShieldCheck,
  Clock,
  Waves,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { MorphicNavbar } from '../components/ui/MorphicNavbar';

interface CodeSnippetProps {
  code: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--surface-2)]/80 border-b border-[var(--border)] text-xs text-[var(--text-muted)] font-mono">
        <span>application/json</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] text-[11px] font-sans transition-colors cursor-pointer border border-[var(--border)] shadow-2xs"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[var(--normal)]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-[var(--text-muted)]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[11px] font-mono text-[var(--live)] leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const HelpPage: React.FC = () => {
  const { t } = useI18n();

  const sections = [
    { id: 'methodology', label: 'Hydrological classification', icon: BookOpen },
    { id: 'api-docs', label: 'REST API documentation', icon: Code2 },
    { id: 'data-standards', label: 'Data standards & quality metrics', icon: Database },
  ];

  const stationsExample = `[
  {
    "id": "stn-01",
    "name": "Patna (Digha Ghat)",
    "river": "Ganga",
    "basin": "Ganga",
    "state": "Bihar",
    "type": "river-level",
    "latitude": 25.6324,
    "longitude": 85.0975,
    "current_level": 50.82,
    "warning_level": 49.30,
    "danger_level": 50.45,
    "hfl": 52.52,
    "trend": "Rising",
    "last_updated": "2026-09-20T05:00:00Z"
  }
]`;

  const observationsExample = `[
  {
    "station_id": "stn-01",
    "timestamp": "2026-09-20T04:00:00Z",
    "water_level_m": 50.78,
    "discharge_cumec": 14200.5,
    "rainfall_mm": 12.4
  },
  {
    "station_id": "stn-01",
    "timestamp": "2026-09-20T05:00:00Z",
    "water_level_m": 50.82,
    "discharge_cumec": 14350.2,
    "rainfall_mm": 8.1
  }
]`;

  const forecastExample = `[
  {
    "station_id": "stn-01",
    "forecast_timestamp": "2026-09-21T05:00:00Z",
    "predicted_level_m": 51.15,
    "confidence_interval_95": [50.95, 51.35],
    "projected_severity": "Severe"
  }
]`;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-12">
      {/* Header */}
      <div className="pb-1 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            {t.helpTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Technical specifications, hydrological classification methodology, and REST API documentation
          </p>
        </div>

        {/* Morphic Navigation Bar */}
        <MorphicNavbar
          items={{
            "/help": { name: "Docs" },
            "/stations": { name: "Stations" },
            "/basins": { name: "Basins" },
            "/disasters": { name: "Disasters" },
          }}
          defaultPath="/help"
          className="mx-0 py-0"
        />
      </div>

      {/* 2-Column Layout with Anchored Sticky Sidebar TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Sidebar Table of Contents */}
        <div className="lg:col-span-3 lg:sticky lg:top-20 space-y-3">
          <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] shadow-xs">
            <span className="text-xs font-semibold text-[var(--text)] block mb-2.5">
              Table of contents
            </span>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[var(--live)]" />
                    <span>{sec.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] shadow-xs text-xs space-y-2">
            <span className="font-semibold text-[var(--text)] block">Quick resources</span>
            <a
              href="http://cwc.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-[var(--text-muted)] hover:text-[var(--live)] transition-colors"
            >
              <span>Central Water Commission</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://ndma.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-[var(--text-muted)] hover:text-[var(--live)] transition-colors"
            >
              <span>National Disaster Management</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Content Sections */}
        <div className="lg:col-span-9 space-y-6">
          {/* ─── 1. Hydrological Classification Methodology ──────────────────── */}
          <section
            id="methodology"
            className="bg-[var(--surface)] rounded-xl p-5 sm:p-6 border border-[var(--border)] shadow-xs space-y-4 scroll-mt-24"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--live)] flex items-center justify-center border border-[var(--border)]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
                {t.methodology}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Flood monitoring thresholds across India are determined through historical hydraulic rating curves, channel geometry, and catchment inundation characteristics standardized by the Central Water Commission (CWC).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              {/* Normal */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center gap-2 font-semibold text-[var(--text)] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--normal)]" />
                  <span>Normal flood stage (Level &lt; warning level)</span>
                </div>
                <p className="text-[var(--text-muted)] mt-1">
                  River water is safely conveyed within the main channel banks without overflow into riparian floodplains.
                </p>
              </div>

              {/* Above Normal */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center gap-2 font-semibold text-[var(--text)] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--watch)]" />
                  <span>Above normal stage (Warning level ≤ level &lt; danger level)</span>
                </div>
                <p className="text-[var(--text-muted)] mt-1">
                  {t.warningLevelDesc} Riparian embankments and bunds are inspected, and 24-hour hydraulic patrols are mobilized.
                </p>
              </div>

              {/* Severe */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center gap-2 font-semibold text-[var(--text)] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]" />
                  <span>Severe flood stage (Danger level ≤ level &lt; HFL)</span>
                </div>
                <p className="text-[var(--text-muted)] mt-1">
                  {t.dangerLevelDesc} Low-lying villages, agricultural lands, and transport infrastructure are inundated. Evacuation orders initiated.
                </p>
              </div>

              {/* Extreme */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex items-center gap-2 font-semibold text-[var(--text)] mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)] animate-pulse" />
                  <span>Extreme flood situation (Level ≥ highest flood level)</span>
                </div>
                <p className="text-[var(--text-muted)] mt-1">
                  {t.hflDesc} Historical flood records breached. Catastrophic widespread inundation requiring National Disaster Response Force (NDRF) deployment.
                </p>
              </div>
            </div>
          </section>

          {/* ─── 2. REST API Documentation ───────────────────────────────────── */}
          <section
            id="api-docs"
            className="bg-[var(--surface)] rounded-xl p-5 sm:p-6 border border-[var(--border)] shadow-xs space-y-4 scroll-mt-24"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--live)] flex items-center justify-center border border-[var(--border)]">
                <Code2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
                {t.apiDocs}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              The FlowShield frontend connects to the backend REST API specified by{' '}
              <code className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[var(--live)] font-mono text-xs">
                VITE_API_BASE
              </code>
              . All field transformations and status calculations are centralized in{' '}
              <code className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[var(--live)] font-mono text-xs">
                src/api/adapter.ts
              </code>
              .
            </p>

            <div className="space-y-4 text-xs font-mono">
              {/* Endpoint 1: GET /stations */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-[var(--text)]">
                  <span className="px-2 py-0.5 rounded bg-[var(--primary)] text-white text-[11px] font-sans">
                    GET
                  </span>
                  <span>/stations</span>
                </div>
                <p className="text-[var(--text-muted)] font-sans text-xs">
                  Retrieves the list of all river-level and reservoir-inflow monitoring stations with current water levels and threshold marks.
                </p>
                <CodeSnippet code={stationsExample} />
              </div>

              {/* Endpoint 2: GET /stations/:id/observations */}
              <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 font-medium text-[var(--text)]">
                  <span className="px-2 py-0.5 rounded bg-[var(--primary)] text-white text-[11px] font-sans">
                    GET
                  </span>
                  <span>/stations/:id/observations</span>
                </div>
                <p className="text-[var(--text-muted)] font-sans text-xs">
                  Chronological hourly time series of observed water level (m), inflow discharge (cumec), and catchment rainfall (mm) for the past 48 hours.
                </p>
                <CodeSnippet code={observationsExample} />
              </div>

              {/* Endpoint 3: GET /stations/:id/forecast */}
              <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2 font-medium text-[var(--text)]">
                  <span className="px-2 py-0.5 rounded bg-[var(--primary)] text-white text-[11px] font-sans">
                    GET
                  </span>
                  <span>/stations/:id/forecast</span>
                </div>
                <p className="text-[var(--text-muted)] font-sans text-xs">
                  24-hour hydrodynamic water level predictions with confidence intervals and projected flood severity.
                </p>
                <CodeSnippet code={forecastExample} />
              </div>
            </div>
          </section>

          {/* ─── 3. Data Dictionary & Standards ───────────────────────────────── */}
          <section
            id="data-standards"
            className="bg-[var(--surface)] rounded-xl p-5 sm:p-6 border border-[var(--border)] shadow-xs space-y-4 scroll-mt-24"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] text-[var(--live)] flex items-center justify-center border border-[var(--border)]">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">
                Data standards &amp; quality metrics
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <Clock className="w-4 h-4 text-[var(--live)] mb-1.5" />
                <h4 className="font-semibold text-[var(--text)]">Auto-refresh cadence</h4>
                <p className="text-[var(--text-muted)] mt-1">
                  Data synchronized automatically every 3 minutes (180,000 ms) via TanStack Query background polling.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <Waves className="w-4 h-4 text-[var(--live)] mb-1.5" />
                <h4 className="font-semibold text-[var(--text)]">Units of measurement</h4>
                <p className="text-[var(--text-muted)] mt-1">
                  Water level in meters (m) above Mean Sea Level (MSL). Inflow/outflow in cubic meters per second (cumec).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <ShieldCheck className="w-4 h-4 text-[var(--live)] mb-1.5" />
                <h4 className="font-semibold text-[var(--text)]">Accessibility &amp; WCAG</h4>
                <p className="text-[var(--text-muted)] mt-1">
                  Built to WCAG 2.1 AA standards with high-contrast palette, ARIA landmarks, keyboard navigation, and reduced-motion modes.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
