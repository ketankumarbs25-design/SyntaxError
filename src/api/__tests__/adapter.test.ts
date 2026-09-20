import { describe, it, expect } from 'vitest';
import {
  mapStationDTOToStation,
  mapObservationDTO,
  mapForecastDTO,
  mapBulletinDTO,
  aggregateBasins,
} from '../adapter';
import type { RawStationDTO } from '../types';

describe('API Field Adapter Mappings', () => {
  it('correctly maps raw station DTO to normalized Station model', () => {
    const raw: RawStationDTO = {
      id: 'stn-test-1',
      code: 'TST-01',
      name: 'Yamuna Bridge',
      hindi_name: 'यमुना ब्रिज',
      type: 'river-level',
      river: 'Yamuna',
      basin: 'Ganga',
      state: 'Delhi',
      district: 'North Delhi',
      latitude: '28.66',
      longitude: '77.24',
      current_level: '205.50',
      warning_level: '204.50',
      danger_level: '205.33',
      hfl: '208.66',
      inflow_cumec: '5400',
      outflow_cumec: '5350',
      trend: 'Rising',
    };

    const station = mapStationDTOToStation(raw);

    expect(station.id).toBe('stn-test-1');
    expect(station.name).toBe('Yamuna Bridge');
    expect(station.hindiName).toBe('यमुना ब्रिज');
    expect(station.type).toBe('river-level');
    expect(station.currentLevel).toBe(205.5);
    expect(station.warningLevel).toBe(204.5);
    expect(station.dangerLevel).toBe(205.33);
    expect(station.hfl).toBe(208.66);
    expect(station.status).toBe('Severe'); // 205.5 >= danger (205.33) and < hfl (208.66)
    expect(station.trend).toBe('Rising');
    expect(station.deltaToDangerM).toBe(0.17); // 205.50 - 205.33
  });

  it('identifies reservoir-inflow stations from type or name', () => {
    const rawReservoir: RawStationDTO = {
      name: 'Tehri Dam',
      type: 'reservoir-inflow',
      latitude: 30.37,
      longitude: 78.48,
    };
    const station = mapStationDTOToStation(rawReservoir);
    expect(station.type).toBe('reservoir-inflow');
  });

  it('handles empty or missing fields with safe defaults', () => {
    const rawIncomplete: RawStationDTO = {
      name: '',
      latitude: 0,
      longitude: 0,
    };
    const station = mapStationDTOToStation(rawIncomplete);
    expect(station.name).toBe('Unnamed Station');
    expect(station.status).toBe('Normal');
    expect(station.trend).toBe('Steady');
  });

  it('correctly maps raw observation DTO to WaterObservation', () => {
    const obs = mapObservationDTO({
      id: 'obs-1',
      station_id: 'stn-01',
      timestamp: '2026-09-20T04:00:00Z',
      water_level: '50.45',
      inflow_cumec: '3200',
      rainfall_mm: '12.4',
    });

    expect(obs.waterLevel).toBe(50.45);
    expect(obs.inflowCumec).toBe(3200);
    expect(obs.rainfallMm).toBe(12.4);
  });

  it('correctly maps raw forecast DTO and computes forecast severity', () => {
    const forecast = mapForecastDTO(
      {
        forecast_time: '2026-09-20T12:00:00Z',
        predicted_level: '52.5',
        trend: 'Rising',
      },
      49.0, // warning
      51.0, // danger
      53.0  // hfl
    );

    expect(forecast.predictedLevel).toBe(52.5);
    expect(forecast.status).toBe('Severe'); // 52.5 >= 51.0 and < 53.0
    expect(forecast.trend).toBe('Rising');
  });

  it('correctly maps raw bulletin DTO', () => {
    const bul = mapBulletinDTO({
      id: 'bul-test',
      bulletin_no: 'CWC/TEST/01',
      title: 'Flood Test Alert',
      title_hi: 'बाढ़ टेस्ट अलर्ट',
      date_time: '2026-09-20T00:00:00Z',
      summary: 'Test summary text',
      severity: 'Severe',
      affected_basins: ['Ganga'],
      affected_states: ['Bihar'],
      key_stations_affected: ['Patna'],
    });

    expect(bul.bulletinNo).toBe('CWC/TEST/01');
    expect(bul.severity).toBe('Severe');
    expect(bul.affectedBasins).toContain('Ganga');
  });

  it('correctly aggregates basin summary statistics', () => {
    const stations = [
      mapStationDTOToStation({
        name: 'Stn A',
        basin: 'Ganga',
        river: 'Ganga',
        current_level: 52,
        warning_level: 50,
        danger_level: 51,
        hfl: 53,
        latitude: 25,
        longitude: 85,
      }),
      mapStationDTOToStation({
        name: 'Stn B',
        basin: 'Ganga',
        river: 'Yamuna',
        current_level: 45,
        warning_level: 50,
        danger_level: 51,
        hfl: 53,
        latitude: 26,
        longitude: 84,
      }),
      mapStationDTOToStation({
        name: 'Stn C',
        basin: 'Brahmaputra',
        river: 'Brahmaputra',
        current_level: 107,
        warning_level: 104,
        danger_level: 105,
        hfl: 106,
        latitude: 27,
        longitude: 94,
      }),
    ];

    const basins = aggregateBasins(stations);
    expect(basins).toHaveLength(2);

    const ganga = basins.find((b) => b.name === 'Ganga');
    expect(ganga).toBeDefined();
    expect(ganga?.totalStations).toBe(2);
    expect(ganga?.severeCount).toBe(1);
    expect(ganga?.normalCount).toBe(1);
    expect(ganga?.majorRivers).toContain('Ganga');
    expect(ganga?.majorRivers).toContain('Yamuna');

    const brahmaputra = basins.find((b) => b.name === 'Brahmaputra');
    expect(brahmaputra?.extremeCount).toBe(1);
  });
});
