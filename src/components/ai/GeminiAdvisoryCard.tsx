/**
 * FLOWSHIELD — GeminiAdvisoryCard
 *
 * Real live LLM emergency advisory generator powered by Google Gemini.
 * Takes live hydrodynamic simulation telemetry and generates official emergency
 * operations briefings and evacuation instructions.
 * - Loading skeleton
 * - Error state with retry
 * - Displays "Unavailable / Offline" if API key is missing (no fake text)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { API_KEYS, API_ENDPOINTS } from '../../config/api';
import type { SimConfig, SimStats, CellState } from '../../sim/types';

const DEFAULT_STATS: SimStats = {
  safeCells: 0, warningCells: 0, criticalCells: 0,
  maxWater: 0, avgWater: 0, affectedArea: 0, affectedPopulation: 0,
  maxDepth: 0, predictedCriticalCount: 0, earliestCriticalTime: null,
};

interface GeminiAdvisoryCardProps {
  config: SimConfig;
  stats: SimStats;
  cells: CellState[];
  currentTime: number;
}

export const GeminiAdvisoryCard: React.FC<GeminiAdvisoryCardProps> = ({
  config,
  stats: statsProp,
  cells,
  currentTime,
}) => {
  const stats: SimStats = statsProp ?? DEFAULT_STATS;
  const [advisoryText, setAdvisoryText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const hasApiKey = Boolean(API_KEYS.GEMINI && API_KEYS.GEMINI !== 'your_gemini_api_key_here');

  const generateAdvisory = useCallback(async () => {
    if (!hasApiKey) {
      setError('LLM_API_KEY is not configured in .env. Enter your Gemini API key to activate live AI emergency briefings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Identify top critical/warning sectors
    const criticalSectors = cells
      .filter((c) => c.risk === 'CRITICAL')
      .map((c) => `${String.fromCharCode(65 + c.row)}${c.col + 1} (${c.water.toFixed(2)}m)`)
      .slice(0, 6);

    const warningSectors = cells
      .filter((c) => c.risk === 'WARNING')
      .map((c) => `${String.fromCharCode(65 + c.row)}${c.col + 1} (${c.water.toFixed(2)}m)`)
      .slice(0, 6);

    const prompt = `
You are the Chief Hydrological Officer at the FlowShield Flood Emergency Operations Command Center.
Generate a concise, authoritative Tactical Emergency Advisory based on this real-time synthetic hydrodynamic simulation:

--- CURRENT TELEMETRY ---
- Mission Time: T+${currentTime.toFixed(0)} minutes
- Rainfall Intensity: ${config.rainfallIntensity} mm/hr (Duration: ${config.rainfallDuration} min)
- Drainage Efficiency: ${(config.drainageEfficiency * 100).toFixed(0)}%
- Peak Surface Inundation Depth: ${stats.maxWater.toFixed(3)} meters
- Risk Tally: ${stats.criticalCells} Critical Zones (>=0.30m), ${stats.warningCells} Warning Zones (0.15-0.30m), ${stats.safeCells} Safe Zones (<0.15m)
- Affected Population (Warning + Critical): ${stats.affectedPopulation.toLocaleString()} citizens
- Critical Sectors: ${criticalSectors.length > 0 ? criticalSectors.join(', ') : 'None yet'}
- Warning Sectors: ${warningSectors.length > 0 ? warningSectors.join(', ') : 'None'}
- Earliest Critical Arrival ETA: ${stats.earliestCriticalTime !== null ? `~${stats.earliestCriticalTime.toFixed(0)} min` : 'Nominal / No Critical Breach'}

Format your response as a professional emergency bulletin with these 3 sections:
1. 🚨 CURRENT THREAT LEVEL & SYNTHESIS (1-2 sentences on severity)
2. 📍 HIGH-RISK SECTORS & EVACUATION DIRECTIVES (Specific zones to evacuate or prepare)
3. 🛠️ DRAINAGE & MITIGATION MEASURES (Recommended tactical countermeasures)
Keep the response under 160 words, strictly factual and actionable.
`.trim();

    try {
      const url = `${API_ENDPOINTS.GEMINI}?key=${API_KEYS.GEMINI}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 350,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status} from Gemini API`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini API returned an empty response.');
      }

      setAdvisoryText(text);
      setLastGeneratedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to Gemini advisory service.');
    } finally {
      setIsLoading(false);
    }
  }, [hasApiKey, config, stats, cells, currentTime]);

  // Initial trigger if key is valid and no advisory exists yet
  useEffect(() => {
    if (hasApiKey && !advisoryText && !isLoading && !error && stats.criticalCells > 0) {
      generateAdvisory();
    }
  }, [hasApiKey, advisoryText, isLoading, error, stats.criticalCells, generateAdvisory]);

  return (
    <div className="w-full bg-[#0a101f]/90 border border-slate-700/60 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">📡</span>
          <div>
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Gemini Emergency Advisory
            </h4>
            <div className="text-[10px] text-slate-400">Live AI Emergency Briefing</div>
          </div>
        </div>

        <button
          onClick={generateAdvisory}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>🔄 {advisoryText ? 'Refresh' : 'Generate'}</>
          )}
        </button>
      </div>

      {/* Body States */}
      <div className="mt-3 min-h-[100px] flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-2 py-2 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
          </div>
        ) : error ? (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs flex flex-col gap-2">
            <div className="text-red-400 font-mono font-semibold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{hasApiKey ? 'Advisory Service Error' : 'Live Advisory Unavailable'}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{error}</p>
            {hasApiKey && (
              <button
                onClick={generateAdvisory}
                className="self-start text-[11px] font-mono px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 rounded-lg transition-colors"
              >
                Retry Request
              </button>
            )}
          </div>
        ) : advisoryText ? (
          <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line space-y-2">
            {advisoryText}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-400 font-sans flex flex-col items-center gap-1.5">
            <span className="text-xl">🛡️</span>
            <span>Click <strong>Generate</strong> to synthesize an emergency operational briefing.</span>
            <span className="text-[10px] text-slate-500 font-mono">
              Powered by real-time cellular telemetry + Gemini 2.0 Flash
            </span>
          </div>
        )}
      </div>

      {/* Footer Timestamp */}
      {lastGeneratedAt && (
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Telemetry Sync: {lastGeneratedAt}</span>
          <span className="text-emerald-400/80">Active Briefing</span>
        </div>
      )}
    </div>
  );
};
