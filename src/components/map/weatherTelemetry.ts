/**
 * FLOWSHIELD — Real Meteorological Telemetry & Flood Risk Computation
 * 
 * Fetches real atmospheric observations and forecasts from Open-Meteo API
 * for any global GPS coordinate without artificial simulation or fake data.
 */

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface AreaTelemetry {
  latitude: number;
  longitude: number;
  temperature: number; // °C
  humidity: number; // %
  precipitation: number; // mm/h current rate
  rain: number; // mm
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  windSpeed: number; // km/h
  forecastRain24h: number; // mm in next 24h
  elevation: number; // m above sea level
  updatedAt: string;
  timezone: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0 to 100
  label: string;
  statusText: string;
  color: string;
  badgeClass: string;
  haloColor: string;
  description: string;
  recommendation: string;
  factors: string[];
}

/**
 * Maps WMO weather interpretation code to user-friendly status and icon.
 */
export function getWeatherDetails(code: number): { label: string; icon: string } {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: '☀️' };
    case 1:
      return { label: 'Mainly Clear', icon: '🌤️' };
    case 2:
      return { label: 'Partly Cloudy', icon: '⛅' };
    case 3:
      return { label: 'Overcast', icon: '☁️' };
    case 45:
    case 48:
      return { label: 'Foggy / Low Visibility', icon: '🌫️' };
    case 51:
      return { label: 'Light Drizzle', icon: '🌦️' };
    case 53:
      return { label: 'Moderate Drizzle', icon: '🌦️' };
    case 55:
      return { label: 'Dense Drizzle', icon: '🌧️' };
    case 56:
    case 57:
      return { label: 'Freezing Drizzle', icon: '🌧️' };
    case 61:
      return { label: 'Slight Rain', icon: '🌧️' };
    case 63:
      return { label: 'Moderate Rain', icon: '🌧️' };
    case 65:
      return { label: 'Heavy Torrential Rain', icon: '⛈️' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', icon: '🌧️' };
    case 71:
    case 73:
    case 75:
      return { label: 'Snowfall', icon: '🌨️' };
    case 80:
      return { label: 'Light Rain Showers', icon: '🌦️' };
    case 81:
      return { label: 'Moderate Rain Showers', icon: '🌧️' };
    case 82:
      return { label: 'Violent Rain Showers', icon: '⛈️' };
    case 95:
      return { label: 'Thunderstorm', icon: '⚡' };
    case 96:
    case 99:
      return { label: 'Severe Thunderstorm & Hail', icon: '⛈️⚡' };
    default:
      return { label: 'Cloudy', icon: '☁️' };
  }
}

/**
 * Computes an objective flood risk assessment purely from real meteorological telemetry.
 */
export function calculateFloodRisk(telemetry: AreaTelemetry): RiskAssessment {
  const { precipitation, forecastRain24h, weatherCode } = telemetry;

  // 1. Current precipitation intensity component (0 - 50 points)
  let rainRateScore = 0;
  if (precipitation > 0) {
    if (precipitation < 2.5) {
      rainRateScore = (precipitation / 2.5) * 15;
    } else if (precipitation < 10) {
      rainRateScore = 15 + ((precipitation - 2.5) / 7.5) * 18;
    } else if (precipitation < 30) {
      rainRateScore = 33 + ((precipitation - 10) / 20) * 12;
    } else {
      rainRateScore = 45 + Math.min(5, (precipitation - 30) * 0.2);
    }
  }

  // 2. 24-hour forecasted precipitation accumulation component (0 - 35 points)
  let forecastScore = 0;
  if (forecastRain24h > 0) {
    if (forecastRain24h < 15) {
      forecastScore = (forecastRain24h / 15) * 10;
    } else if (forecastRain24h < 45) {
      forecastScore = 10 + ((forecastRain24h - 15) / 30) * 13;
    } else if (forecastRain24h < 90) {
      forecastScore = 23 + ((forecastRain24h - 45) / 45) * 8;
    } else {
      forecastScore = 31 + Math.min(4, (forecastRain24h - 90) * 0.1);
    }
  }

  // 3. Convective / Severe Storm Severity modifier (0 - 15 points)
  let stormModifier = 0;
  if (weatherCode === 95) stormModifier = 8;
  if (weatherCode === 96 || weatherCode === 99) stormModifier = 14;
  if (weatherCode === 65 || weatherCode === 82) stormModifier = 10;

  // Total risk score 0 - 100
  const rawScore = Math.round(rainRateScore + forecastScore + stormModifier);
  const score = Math.max(0, Math.min(100, rawScore));

  const factors: string[] = [];
  if (precipitation > 0) {
    factors.push(`Active rain rate: ${precipitation.toFixed(1)} mm/h`);
  } else {
    factors.push('No immediate rainfall detected');
  }

  if (forecastRain24h > 0) {
    factors.push(`24h forecast total: ${forecastRain24h.toFixed(1)} mm`);
  }

  if (stormModifier > 0) {
    factors.push(`Atmospheric instability: ${getWeatherDetails(weatherCode).label}`);
  }

  if (score <= 25) {
    return {
      level: 'LOW',
      score,
      label: 'Low Flood Risk',
      statusText: 'SAFE',
      color: '#10b981', // emerald-500
      badgeClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      haloColor: '#10b981',
      description: 'Local drainage and surface absorption are within normal capacities. Minimal hydrological threat.',
      recommendation: 'Normal operations. No active flood watch necessary.',
      factors,
    };
  }

  if (score <= 55) {
    return {
      level: 'MODERATE',
      score,
      label: 'Moderate / Advisory',
      statusText: 'ADVISORY',
      color: '#eab308', // yellow-500
      badgeClass: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
      haloColor: '#eab308',
      description: 'Localized ponding and curb overflow possible in poorly drained intersections and basements.',
      recommendation: 'Monitor storm drains and low-lying road corridors. Keep drainage channels clear.',
      factors,
    };
  }

  if (score <= 80) {
    return {
      level: 'HIGH',
      score,
      label: 'High Flood Risk',
      statusText: 'WARNING',
      color: '#f97316', // orange-500
      badgeClass: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
      haloColor: '#f97316',
      description: 'Significant street waterlogging and underpass inundation probable. Catchment channels near capacity.',
      recommendation: 'Issue local flood advisories. Prepare pumps for flood-prone road crossings.',
      factors,
    };
  }

  return {
    level: 'CRITICAL',
    score,
    label: 'Critical Hazard',
    statusText: 'CRITICAL',
    color: '#ef4444', // red-500
    badgeClass: 'text-red-400 bg-red-500/15 border-red-500/30',
    haloColor: '#ef4444',
    description: 'Torrential rainfall exceeding urban absorption capacity. Rapid flash flooding in nullahs & depressions.',
    recommendation: 'Immediate flood alert. Divert traffic from low-lying areas and activate emergency response teams.',
    factors,
  };
}

/**
 * Fetches real weather and forecasts from Open-Meteo for the provided coordinates.
 */
export async function fetchAreaWeatherTelemetry(
  lat: number,
  lon: number
): Promise<{ telemetry: AreaTelemetry; risk: RiskAssessment }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch weather telemetry (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  const current = data.current || {};
  const hourly = data.hourly || {};

  // Sum up the 24-hour forecasted precipitation
  let forecastRain24h = 0;
  if (Array.isArray(hourly.precipitation)) {
    forecastRain24h = hourly.precipitation.slice(0, 24).reduce((acc: number, val: number) => acc + (val || 0), 0);
  }

  const weatherDetails = getWeatherDetails(current.weather_code ?? 0);

  const telemetry: AreaTelemetry = {
    latitude: lat,
    longitude: lon,
    temperature: current.temperature_2m ?? 22,
    humidity: current.relative_humidity_2m ?? 70,
    precipitation: current.precipitation ?? 0,
    rain: current.rain ?? 0,
    weatherCode: current.weather_code ?? 0,
    weatherDesc: weatherDetails.label,
    weatherIcon: weatherDetails.icon,
    windSpeed: current.wind_speed_10m ?? 0,
    forecastRain24h: Math.round(forecastRain24h * 10) / 10,
    elevation: data.elevation ?? 0,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timezone: data.timezone || 'UTC',
  };

  const risk = calculateFloodRisk(telemetry);

  return { telemetry, risk };
}
