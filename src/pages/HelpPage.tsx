import React from 'react';
import {
  Code2,
  Database,
  BookOpen,
  ShieldCheck,
  Clock,
  Waves,
} from 'lucide-react';
import { useI18n } from '../i18n';

export const HelpPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.helpTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Technical specifications, hydrological classification methodology, and REST API documentation.
        </p>
      </div>

      {/* ─── 1. Hydrological Classification Methodology ──────────────────── */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.methodology}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Flood monitoring thresholds across India are determined through historical hydraulic rating curves, channel geometry, and catchment inundation characteristics standardized by the Central Water Commission (CWC).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          {/* Normal */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Normal Flood Stage (Level &lt; Warning Level)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              River water is safely conveyed within the main channel banks without overflow into riparian floodplains.
            </p>
          </div>

          {/* Above Normal */}
          <div className="p-4 rounded-xl bg-yellow-50/60 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50">
            <div className="flex items-center gap-2 font-bold text-yellow-800 dark:text-yellow-300 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span>Above Normal Stage (Warning Level ≤ Level &lt; Danger Level)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {t.warningLevelDesc} Riparian embankments and bunds are inspected, and 24-hour hydraulic patrols are mobilized.
            </p>
          </div>

          {/* Severe */}
          <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50">
            <div className="flex items-center gap-2 font-bold text-orange-800 dark:text-orange-300 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
              <span>Severe Flood Stage (Danger Level ≤ Level &lt; HFL)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {t.dangerLevelDesc} Low-lying villages, agricultural lands, and transport infrastructure are inundated. Evacuation orders initiated.
            </p>
          </div>

          {/* Extreme */}
          <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
            <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-300 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Extreme Flood Situation (Level ≥ Highest Flood Level)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {t.hflDesc} Historical flood records breached. Catastrophic widespread inundation requiring National Disaster Response Force (NDRF) deployment.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. REST API Documentation ───────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.apiDocs}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          The FlowShield frontend connects to the backend REST API specified by <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 font-mono text-xs">VITE_API_BASE</code>.
          All field transformations and status calculations are centralized in <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 font-mono text-xs">src/api/adapter.ts</code>.
        </p>

        <div className="space-y-4 text-xs font-mono">
          {/* Endpoint 1: GET /stations */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px]">GET</span>
              <span>/stations</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-sans text-xs mb-2">
              Retrieves the list of all river-level and reservoir-inflow monitoring stations with current water levels and threshold marks.
            </p>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto text-[11px]">
{`[
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
]`}
            </pre>
          </div>

          {/* Endpoint 2: GET /stations/:id/observations */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px]">GET</span>
              <span>/stations/:id/observations</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-sans text-xs mb-2">
              Chronological hourly time series of observed water level (m), inflow discharge (cumec), and catchment rainfall (mm) for the past 48 hours.
            </p>
          </div>

          {/* Endpoint 3: GET /stations/:id/forecast */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px]">GET</span>
              <span>/stations/:id/forecast</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-sans text-xs mb-2">
              24-hour hydrodynamic water level predictions with confidence intervals and projected flood severity.
            </p>
          </div>

          {/* Endpoint 4: GET /bulletins */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px]">GET</span>
              <span>/bulletins</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-sans text-xs mb-2">
              Official Central Flood Forecasting advisories, impacted basins, states, and critical stations.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. Data Dictionary & Standards ───────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Data Standards &amp; Quality Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Clock className="w-4 h-4 text-blue-600 mb-1" />
            <h4 className="font-bold text-slate-900 dark:text-white">Auto-Refresh Cadence</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Data synchronized automatically every 3 minutes (180,000 ms) via TanStack Query background polling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <Waves className="w-4 h-4 text-blue-600 mb-1" />
            <h4 className="font-bold text-slate-900 dark:text-white">Units of Measurement</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Water Level in meters (m) above Mean Sea Level (MSL). Inflow/Outflow in cubic meters per second (cumec).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <ShieldCheck className="w-4 h-4 text-blue-600 mb-1" />
            <h4 className="font-bold text-slate-900 dark:text-white">Accessibility &amp; WCAG</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Built to WCAG 2.1 AA standards with high-contrast palette, ARIA landmarks, keyboard navigation, and reduced-motion modes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
