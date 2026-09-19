/**
 * FLOWSHIELD — Weather & Environmental Telemetry Types
 * Inspired by BBC Weather (https://www.bbc.com/weather/1277333)
 */

export type TemperatureUnit = 'c' | 'f';
export type WindSpeedUnit = 'kph' | 'mph';

export interface WeatherUnits {
  temp: TemperatureUnit;
  wind: WindSpeedUnit;
}

export interface HourlyForecastItem {
  time: string;
  hour: number;
  tempC: number;
  feelsLikeC: number;
  pop: number; // Probability of Precipitation (0 - 100%)
  rainMm: number;
  windSpeedKph: number;
  windDeg: number;
  humidity: number;
  uvIndex: number;
  icon: string;
  description: string;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  isToday?: boolean;
  maxTempC: number;
  minTempC: number;
  pop: number;
  rainMm: number;
  windSpeedKph: number;
  windDeg: number;
  icon: string;
  description: string;
  hourly: HourlyForecastItem[];
}

export interface AirQualityMetrics {
  aqi: number; // 1-5 scale
  label: string;
  color: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

export interface EnvironmentalData {
  city: string;
  country: string;
  locationId?: string;
  lat: number;
  lon: number;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  pressureHpa: number;
  pressureTrend: 'rising' | 'steady' | 'falling';
  windSpeedKph: number;
  windGustKph: number;
  windDeg: number;
  visibilityKm: number;
  uvIndex: number;
  dewPointC: number;
  cloudsPercent: number;
  rainMmPerHour: number;
  description: string;
  icon: string;
  sunriseTs: number;
  sunsetTs: number;
  observedTime: string;
  airQuality?: AirQualityMetrics;
  alert?: {
    severity: 'yellow' | 'amber' | 'red';
    title: string;
    description: string;
  };
  daily: DailyForecastItem[];
}
