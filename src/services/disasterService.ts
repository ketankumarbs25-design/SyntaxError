/**
 * FLOWSHIELD — Historical Disaster Service Layer
 *
 * Pluggable architecture separating the UI from data fetching:
 * 1. Checks for real API credentials via environment variables (VITE_HISTORICAL_DISASTER_API_KEY & ENDPOINT)
 * 2. Falls back seamlessly to the curated historical archive (mock data)
 * 3. Normalizes user input (handles casing, trimming, and common Indian city aliases)
 * 4. Aggregates category counts dynamically (only active categories with >0 events)
 * 5. Sorts events chronologically (descending)
 */

import type {
  DisasterCategoryCount,
  HistoricalDisasterEvent,
  HistoricalDisasterResponse,
} from '../types/disaster';
import { DISASTER_TYPE_METADATA, MOCK_CITY_DISASTER_RECORDS } from '../data/mockDisasters';
import { API_KEYS, API_ENDPOINTS } from '../config/api';

/**
 * Common Indian city aliases and misspellings mapping to the canonical record
 */
const CITY_ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  bengalooru: 'bengaluru',
  blr: 'bengaluru',
  bombay: 'mumbai',
  mumbay: 'mumbai',
  bom: 'mumbai',
  madras: 'chennai',
  chenay: 'chennai',
  maa: 'chennai',
  gauhati: 'guwahati',
  gowahati: 'guwahati',
  dispur: 'guwahati',
  patliputra: 'patna',
  cochin: 'kochi',
  ernakulam: 'kochi',
  kerala: 'kochi',
  meppadi: 'wayanad',
  chooralmala: 'wayanad',
  calcutta: 'kolkata',
  ccu: 'kolkata',
  newdelhi: 'delhi',
  'new delhi': 'delhi',
  ncr: 'delhi',
  secunderabad: 'hyderabad',
  hyd: 'hyderabad',
};

/**
 * List of suggested default cities for quick exploration
 */
export const SUGGESTED_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Chennai',
  'Patna',
  'Guwahati',
  'Kochi',
  'Wayanad',
  'Delhi',
  'Kolkata',
  'Hyderabad',
];

/**
 * Normalizes input string (lowercased, trimmed, stripped of special characters)
 */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

/**
 * Aggregates category counts for a list of events.
 * Only returns categories that have count > 0.
 */
export function aggregateCategories(events: HistoricalDisasterEvent[]): DisasterCategoryCount[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(event.disasterType, (counts.get(event.disasterType) || 0) + 1);
  }

  const result: DisasterCategoryCount[] = [];

  for (const [typeKey, count] of counts.entries()) {
    const meta = DISASTER_TYPE_METADATA[typeKey as keyof typeof DISASTER_TYPE_METADATA] || {
      label: typeKey,
      icon: '⚠️',
    };
    result.push({
      type: typeKey as any,
      label: meta.label,
      icon: meta.icon,
      count,
    });
  }

  // Sort by count descending
  return result.sort((a, b) => b.count - a.count);
}

/**
 * Main Disaster Service client
 */
export class DisasterService {
  /**
   * Retrieves historical disasters for a given city name.
   * Can call live API if configured, otherwise uses curated mock data.
   */
  public static async getHistoricalDisasters(cityQuery: string): Promise<HistoricalDisasterResponse> {
    const rawClean = cityQuery.trim();

    if (!rawClean) {
      return {
        query: '',
        found: false,
        city: null,
        state: null,
        country: null,
        totalEvents: 0,
        categories: [],
        events: [],
        sourceMode: 'curated_mock',
        errorMessage: 'City name cannot be empty.',
      };
    }

    const normalized = normalizeQuery(rawClean);
    const resolvedKey = CITY_ALIASES[normalized] || normalized;

    // Check if live API endpoint and key are configured
    const liveEndpoint = (API_ENDPOINTS as any).HISTORICAL_DISASTERS;
    const liveApiKey = (API_KEYS as any).HISTORICAL_DISASTERS;

    if (liveEndpoint && liveApiKey) {
      try {
        return await this.fetchFromLiveApi(rawClean, liveEndpoint, liveApiKey);
      } catch (err: any) {
        console.warn('Live disaster API request failed, falling back to curated mock data:', err);
        // Fall through to mock dataset
      }
    }

    // Curated Mock Data fallback with simulated network latency for smooth UI feel
    await new Promise((resolve) => setTimeout(resolve, 320));

    const record = MOCK_CITY_DISASTER_RECORDS.find(
      (r) =>
        r.normalizedQuery === resolvedKey ||
        r.city.toLowerCase() === resolvedKey ||
        r.aliases.includes(resolvedKey) ||
        r.normalizedQuery.includes(resolvedKey) ||
        resolvedKey.includes(r.normalizedQuery)
    );

    if (!record || record.events.length === 0) {
      return {
        query: rawClean,
        found: false,
        city: null,
        state: null,
        country: null,
        totalEvents: 0,
        categories: [],
        events: [],
        sourceMode: 'curated_mock',
      };
    }

    // Sort chronologically descending (newest first)
    const sortedEvents = [...record.events].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.date.localeCompare(a.date);
    });

    return {
      query: rawClean,
      found: true,
      city: record.city,
      state: record.state,
      country: record.country,
      totalEvents: sortedEvents.length,
      categories: aggregateCategories(sortedEvents),
      events: sortedEvents,
      sourceMode: 'curated_mock',
    };
  }

  /**
   * Placeholder helper to connect to future real disaster / news API.
   * To connect a real API:
   * 1. Provide VITE_HISTORICAL_DISASTER_API_KEY and VITE_HISTORICAL_DISASTER_API_ENDPOINT in .env
   * 2. Format the response to match HistoricalDisasterResponse schema below
   */
  private static async fetchFromLiveApi(
    city: string,
    endpoint: string,
    apiKey: string
  ): Promise<HistoricalDisasterResponse> {
    const url = new URL(endpoint);
    url.searchParams.set('city', city);
    url.searchParams.set('country', 'India');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Disaster API responded with status ${res.status}`);
    }

    const data = await res.json();

    // Map external API payload to our standard interface:
    const events: HistoricalDisasterEvent[] = (data.events || []).map((item: any, idx: number) => ({
      id: item.id || `live-${idx}`,
      city: item.city || city,
      state: item.state || 'Data unavailable',
      country: item.country || 'India',
      disasterType: item.disasterType || 'Other',
      date: item.date || 'Data unavailable',
      year: item.year || (item.date ? parseInt(item.date.slice(0, 4), 10) : new Date().getFullYear()),
      endDate: item.endDate || null,
      duration: item.duration || 'Data unavailable',
      severity: item.severity || 'Moderate',
      headline: item.headline || null,
      description: item.description || 'Data unavailable',
      impact: {
        affectedPopulation: item.impact?.affectedPopulation || null,
        casualties: item.impact?.casualties || null,
        damageEstimate: item.impact?.damageEstimate || null,
        areasAffected: item.impact?.areasAffected || null,
      },
      source: item.source || 'Data unavailable',
      sourceUrl: item.sourceUrl || null,
      isCuratedArchive: false,
    }));

    return {
      query: city,
      found: events.length > 0,
      city: data.city || city,
      state: data.state || null,
      country: data.country || 'India',
      totalEvents: events.length,
      categories: aggregateCategories(events),
      events,
      sourceMode: 'live_api',
    };
  }
}
