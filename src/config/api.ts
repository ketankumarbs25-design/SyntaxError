/**
 * FLOWSHIELD — API Configuration
 *
 * Centralized API keys and endpoints.
 * ⚠️ In production, move these to environment variables (.env).
 */

export const API_KEYS = {
  OPENWEATHERMAP: import.meta.env.VITE_OPENWEATHERMAP_API_KEY || '',
  GEMINI: import.meta.env.VITE_GEMINI_API_KEY || '',
} as const;

export const API_ENDPOINTS = {
  OWM_WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
  OWM_AIR_QUALITY: 'https://api.openweathermap.org/data/2.5/air_pollution',
  OWM_FORECAST: 'https://api.openweathermap.org/data/2.5/forecast',
  OWM_ICON: 'https://openweathermap.org/img/wn',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
} as const;
