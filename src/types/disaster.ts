/**
 * FLOWSHIELD — Historical Disaster Intelligence Data Models
 *
 * Strongly-typed definitions for disaster events, categories,
 * severity tiers, impact metrics, and query responses.
 */

export type DisasterType =
  | 'Flood'
  | 'Extreme Rainfall'
  | 'Landslide'
  | 'Cyclone'
  | 'Earthquake'
  | 'Drought'
  | 'Other';

export type DisasterSeverity = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface DisasterImpact {
  affectedPopulation?: number | string | null;
  casualties?: number | string | null;
  damageEstimate?: string | null;
  areasAffected?: string[] | null;
}

export interface HistoricalDisasterEvent {
  id: string;
  city: string;
  state: string;
  country: string;
  disasterType: DisasterType;
  date: string; // ISO format (e.g. "2024-09-05") or human readable (e.g. "September 2024")
  year: number;
  endDate?: string | null;
  duration?: string | null;
  severity: DisasterSeverity;
  headline?: string | null;
  description: string;
  impact?: DisasterImpact | null;
  source?: string | null;
  sourceUrl?: string | null;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  isCuratedArchive?: boolean;
}

export interface DisasterCategoryCount {
  type: DisasterType;
  label: string;
  icon: string;
  count: number;
}

export interface CityDisasterRecord {
  city: string;
  state: string;
  country: string;
  normalizedQuery: string;
  aliases: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  events: HistoricalDisasterEvent[];
}

export interface HistoricalDisasterResponse {
  query: string;
  found: boolean;
  city: string | null;
  state: string | null;
  country: string | null;
  totalEvents: number;
  categories: DisasterCategoryCount[];
  events: HistoricalDisasterEvent[];
  sourceMode: 'curated_mock' | 'live_api';
  errorMessage?: string | null;
}
