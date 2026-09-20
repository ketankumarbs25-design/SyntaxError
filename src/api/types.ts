/**
 * FLOWSHIELD INDIA — Hydrological Flood Forecast Data Types
 *
 * Types for raw API DTOs and normalized domain models.
 */

export type StationType = 'river-level' | 'reservoir-inflow';

export type StationStatus = 'Normal' | 'Above normal' | 'Severe' | 'Extreme';

export type TrendDirection = 'Rising' | 'Falling' | 'Steady';

export interface RawStationDTO {
  id?: string;
  station_id?: string;
  code?: string;
  name: string;
  hindi_name?: string;
  type?: string;
  river?: string;
  basin?: string;
  sub_basin?: string;
  state?: string;
  district?: string;
  latitude: number | string;
  longitude: number | string;
  elevation_m?: number | string;
  current_level?: number | string;
  water_level?: number | string;
  inflow_cumec?: number | string;
  outflow_cumec?: number | string;
  warning_level?: number | string;
  danger_level?: number | string;
  hfl?: number | string;
  hfl_date?: string;
  last_updated?: string;
  status?: string;
  trend?: string;
}

export interface RawObservationDTO {
  id?: string;
  station_id?: string;
  timestamp: string;
  water_level: number | string;
  inflow_cumec?: number | string;
  outflow_cumec?: number | string;
  rainfall_mm?: number | string;
}

export interface RawForecastDTO {
  id?: string;
  station_id?: string;
  forecast_time: string;
  predicted_level: number | string;
  predicted_inflow?: number | string;
  confidence_lower?: number | string;
  confidence_upper?: number | string;
  trend?: string;
  severity?: string;
}

export interface RawBulletinDTO {
  id: string;
  bulletin_no: string;
  title: string;
  title_hi?: string;
  date_time: string;
  summary: string;
  summary_hi?: string;
  severity: 'Advisory' | 'Warning' | 'Severe' | 'Extreme';
  affected_basins: string[];
  affected_states: string[];
  key_stations_affected: string[];
  url?: string;
}

// Normalized UI Domain Models
export interface Station {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  type: StationType;
  river: string;
  basin: string;
  subBasin: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  currentLevel: number;
  inflowCumec: number;
  outflowCumec: number;
  warningLevel: number;
  dangerLevel: number;
  hfl: number; // Highest Flood Level
  hflDate: string;
  lastUpdated: string;
  status: StationStatus;
  trend: TrendDirection;
  capacityUtilizationPct: number;
  deltaToDangerM: number;
  deltaToHflM: number;
}

export interface WaterObservation {
  id: string;
  stationId: string;
  timestamp: string;
  waterLevel: number;
  inflowCumec: number;
  outflowCumec: number;
  rainfallMm: number;
}

export interface WaterForecast {
  id: string;
  stationId: string;
  forecastTime: string;
  predictedLevel: number;
  predictedInflow: number;
  confidenceLower: number;
  confidenceUpper: number;
  trend: TrendDirection;
  status: StationStatus;
}

export interface FloodBulletin {
  id: string;
  bulletinNo: string;
  title: string;
  titleHi: string;
  dateTime: string;
  summary: string;
  summaryHi: string;
  severity: 'Advisory' | 'Warning' | 'Severe' | 'Extreme';
  affectedBasins: string[];
  affectedStates: string[];
  keyStationsAffected: string[];
}

export interface BasinSummary {
  name: string;
  hindiName: string;
  totalStations: number;
  normalCount: number;
  aboveNormalCount: number;
  severeCount: number;
  extremeCount: number;
  averageLevel: number;
  highestRiskStation: string;
  majorRivers: string[];
}
