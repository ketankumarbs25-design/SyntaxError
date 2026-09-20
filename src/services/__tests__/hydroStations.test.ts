import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  STATION_COORDS,
  owmProvider,
  openMeteoFloodProvider,
  wrisProvider,
  getSyntheticReadings,
  getStationReadings,
  type StationReading,
} from '../hydroStations';
import * as configApi from '../../config/api';

describe('Hydro Station Multi-Provider Integration (hydroStations)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. STATION_COORDS Lookup Table', () => {
    it('contains valid coordinate definitions for national telemetry stations', () => {
      expect(STATION_COORDS['stn-01']).toBeDefined();
      expect(STATION_COORDS['stn-01'].name).toContain('Patna');
      expect(STATION_COORDS['stn-01'].lat).toBeGreaterThan(0);
      expect(STATION_COORDS['stn-01'].lon).toBeGreaterThan(0);
      expect(STATION_COORDS['stn-01'].basin).toBe('Ganga');
    });

    it('contains regional urban monitoring station (e.g. Yelahanka/Bengaluru)', () => {
      expect(STATION_COORDS['stn-blr-01']).toBeDefined();
      expect(STATION_COORDS['stn-blr-01'].lat).toBeCloseTo(13.1007, 3);
      expect(STATION_COORDS['stn-blr-01'].lon).toBeCloseTo(77.5963, 3);
    });
  });

  describe('2. Synthetic / Fallback Provider', () => {
    it('returns synthetic readings with valid StationReading shape', () => {
      const readings = getSyntheticReadings(['stn-01', 'stn-02']);
      expect(readings.length).toBe(2);

      const first = readings[0];
      expect(first.stationId).toBe('stn-01');
      expect(first.source).toBe('synthetic');
      expect(typeof first.riverLevel_m).toBe('number');
      expect(typeof first.lat).toBe('number');
      expect(typeof first.lon).toBe('number');
      expect(first.timestamp).toBeDefined();
    });

    it('omits unknown station IDs gracefully', () => {
      const readings = getSyntheticReadings(['non-existent-id']);
      expect(readings.length).toBe(0);
    });
  });

  describe('3. OpenWeatherMap Provider', () => {
    it('throws error when API key is missing', async () => {
      vi.spyOn(configApi, 'API_KEYS', 'get').mockReturnValue({
        OPENWEATHERMAP: '',
        GEMINI: '',
      });

      await expect(owmProvider.fetchReadings(['stn-01'])).rejects.toThrow(
        'OpenWeatherMap API key is not configured'
      );
    });

    it('successfully fetches and maps OWM weather data when API key is present', async () => {
      vi.spyOn(configApi, 'API_KEYS', 'get').mockReturnValue({
        OPENWEATHERMAP: 'mock-owm-api-key',
        GEMINI: '',
      });

      const mockOwmResponse = {
        name: 'Patna Live Station',
        rain: { '1h': 4.5 },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOwmResponse,
      } as unknown as Response);

      const readings = await owmProvider.fetchReadings(['stn-01']);

      expect(readings.length).toBe(1);
      expect(readings[0].stationId).toBe('stn-01');
      expect(readings[0].source).toBe('openweathermap');
      expect(readings[0].rainfall_mm_hr).toBe(4.5);
      expect(readings[0].riverLevel_m).toBe(STATION_COORDS['stn-01'].riverLevel_m);
    });

    it('throws when OWM endpoint returns non-200 status', async () => {
      vi.spyOn(configApi, 'API_KEYS', 'get').mockReturnValue({
        OPENWEATHERMAP: 'mock-owm-api-key',
        GEMINI: '',
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      } as unknown as Response);

      await expect(owmProvider.fetchReadings(['stn-01'])).rejects.toThrow(
        'OWM failed for station stn-01 with status 401'
      );
    });
  });

  describe('4. WRIS Provider Stub', () => {
    it('returns empty array cleanly without crashing', async () => {
      const readings = await wrisProvider.fetchReadings(['stn-01']);
      expect(readings).toEqual([]);
    });
  });

  describe('5. Open-Meteo Flood Provider', () => {
    it('fetches and maps river discharge without requiring an API key', async () => {
      const mockFloodRes = {
        latitude: 25.63,
        longitude: 85.1,
        daily: {
          time: ['2026-09-20'],
          river_discharge: [1800.5],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockFloodRes,
      } as unknown as Response);

      const readings = await openMeteoFloodProvider.fetchReadings(['stn-01']);
      expect(readings.length).toBe(1);
      expect(readings[0].stationId).toBe('stn-01');
      expect(readings[0].source).toBe('openmeteo');
      expect(readings[0].riverLevel_m).toBeGreaterThan(0);
    });
  });

  describe('6. getStationReadings Fanout & Fallback', () => {
    it('falls back to synthetic data when providers fail (guaranteeing zero blank screen)', async () => {
      // Force both providers to fail
      vi.spyOn(openMeteoFloodProvider, 'fetchReadings').mockRejectedValue(new Error('OpenMeteo down'));
      vi.spyOn(owmProvider, 'fetchReadings').mockRejectedValue(new Error('Network down'));

      const readings = await getStationReadings(['stn-01', 'stn-02']);

      expect(readings.length).toBe(2);
      expect(readings[0].source).toBe('synthetic');
      expect(readings[0].stationId).toBe('stn-01');
      expect(readings[1].stationId).toBe('stn-02');
    });

    it('returns live OWM data when provider succeeds', async () => {
      vi.spyOn(openMeteoFloodProvider, 'fetchReadings').mockResolvedValue([]);
      const mockLiveReading: StationReading = {
        stationId: 'stn-01',
        name: 'Patna Live',
        lat: 25.6324,
        lon: 85.0975,
        rainfall_mm_hr: 3.2,
        riverLevel_m: 50.82,
        timestamp: new Date().toISOString(),
        source: 'openweathermap',
      };

      vi.spyOn(owmProvider, 'fetchReadings').mockResolvedValue([mockLiveReading]);

      const readings = await getStationReadings(['stn-01']);

      expect(readings.length).toBe(1);
      expect(readings[0].source).toBe('openweathermap');
      expect(readings[0].rainfall_mm_hr).toBe(3.2);
    });
  });
});
