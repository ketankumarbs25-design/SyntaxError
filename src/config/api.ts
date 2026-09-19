/**
 * FLOWSHIELD — API Configuration
 *
 * Centralized API keys and endpoints.
 * Reads environment variables from Vite runtime.
 */

export const API_KEYS = {
  OPENWEATHERMAP:
    (import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string) || '',
  GEMINI:
    (import.meta.env.VITE_LLM_API_KEY as string) ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    (import.meta.env.LLM_API_KEY as string) ||
    '',
} as const;

export const API_ENDPOINTS = {
  OWM_WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
  OWM_AIR_QUALITY: 'https://api.openweathermap.org/data/2.5/air_pollution',
  OWM_FORECAST: 'https://api.openweathermap.org/data/2.5/forecast',
  OWM_ICON: 'https://openweathermap.org/img/wn',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  BACKEND_BASE: 'http://localhost:8000',
} as const;
