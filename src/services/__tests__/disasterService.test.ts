import { describe, it, expect } from 'vitest';
import {
  DisasterService,
  normalizeQuery,
  aggregateCategories,
  SUGGESTED_CITIES,
} from '../disasterService';
import type { HistoricalDisasterEvent } from '../../types/disaster';

describe('Historical Disaster Service', () => {
  it('normalizes queries correctly with whitespace and casing', () => {
    expect(normalizeQuery('  Bengaluru  ')).toBe('bengaluru');
    expect(normalizeQuery('BENGALURU')).toBe('bengaluru');
    expect(normalizeQuery('   Mumbai, Maharashtra! ')).toBe('mumbai maharashtra');
  });

  it('retrieves Bengaluru historical records', async () => {
    const res = await DisasterService.getHistoricalDisasters('Bengaluru');
    expect(res.found).toBe(true);
    expect(res.city).toBe('Bengaluru');
    expect(res.state).toBe('Karnataka');
    expect(res.totalEvents).toBeGreaterThan(0);
    expect(res.categories.length).toBeGreaterThan(0);
    // Verified descending chronological order
    for (let i = 0; i < res.events.length - 1; i++) {
      expect(res.events[i].year).toBeGreaterThanOrEqual(res.events[i + 1].year);
    }
  });

  it('maps common aliases (Bangalore -> Bengaluru, Bombay -> Mumbai)', async () => {
    const resBangalore = await DisasterService.getHistoricalDisasters('bangalore');
    expect(resBangalore.found).toBe(true);
    expect(resBangalore.city).toBe('Bengaluru');

    const resBombay = await DisasterService.getHistoricalDisasters('bombay');
    expect(resBombay.found).toBe(true);
    expect(resBombay.city).toBe('Mumbai');

    const resMadras = await DisasterService.getHistoricalDisasters('madras');
    expect(resMadras.found).toBe(true);
    expect(resMadras.city).toBe('Chennai');
  });

  it('aggregates category counts and only includes categories with count > 0', () => {
    const sampleEvents: HistoricalDisasterEvent[] = [
      {
        id: '1',
        city: 'TestCity',
        state: 'TestState',
        country: 'India',
        disasterType: 'Flood',
        date: '2024-01-01',
        year: 2024,
        severity: 'High',
        description: 'Test flood',
      },
      {
        id: '2',
        city: 'TestCity',
        state: 'TestState',
        country: 'India',
        disasterType: 'Flood',
        date: '2023-01-01',
        year: 2023,
        severity: 'Moderate',
        description: 'Test flood 2',
      },
      {
        id: '3',
        city: 'TestCity',
        state: 'TestState',
        country: 'India',
        disasterType: 'Cyclone',
        date: '2022-01-01',
        year: 2022,
        severity: 'Severe',
        description: 'Test cyclone',
      },
    ];

    const categories = aggregateCategories(sampleEvents);
    expect(categories).toHaveLength(2);
    const floodCat = categories.find((c) => c.type === 'Flood');
    const cycloneCat = categories.find((c) => c.type === 'Cyclone');
    const landslideCat = categories.find((c) => c.type === 'Landslide');

    expect(floodCat).toBeDefined();
    expect(floodCat?.count).toBe(2);
    expect(cycloneCat).toBeDefined();
    expect(cycloneCat?.count).toBe(1);
    expect(landslideCat).toBeUndefined(); // count is 0, must not be included
  });

  it('handles non-existent city query gracefully', async () => {
    const res = await DisasterService.getHistoricalDisasters('Atlantis');
    expect(res.found).toBe(false);
    expect(res.events).toHaveLength(0);
    expect(res.categories).toHaveLength(0);
  });

  it('handles empty query gracefully', async () => {
    const res = await DisasterService.getHistoricalDisasters('   ');
    expect(res.found).toBe(false);
    expect(res.errorMessage).toBe('City name cannot be empty.');
  });

  it('verifies all default suggested cities return valid records', async () => {
    for (const city of SUGGESTED_CITIES) {
      const res = await DisasterService.getHistoricalDisasters(city);
      expect(res.found).toBe(true);
      expect(res.totalEvents).toBeGreaterThan(0);
    }
  });
});
