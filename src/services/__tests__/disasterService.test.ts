import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  HISTORICAL_INDIAN_DISASTERS,
  getDisasterArticles,
  fetchGDACSDisasterReports,
  fetchNASAEONETEvents,
  isGenuineDisasterArticle,
  DisasterService,
  normalizeQuery,
  aggregateCategories,
  SUGGESTED_CITIES,
} from '../disasterService';
import type { HistoricalDisasterEvent } from '../../types/disaster';

describe('disasterService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('contains essential historical landmark Indian disasters', () => {
    expect(HISTORICAL_INDIAN_DISASTERS.length).toBeGreaterThan(10);
    const kedarnath = HISTORICAL_INDIAN_DISASTERS.find((d) => d.id.includes('kedarnath'));
    expect(kedarnath).toBeDefined();
    expect(kedarnath?.state).toBe('Uttarakhand');
    expect(kedarnath?.year).toBe(2013);

    const kerala = HISTORICAL_INDIAN_DISASTERS.find((d) => d.id.includes('kerala'));
    expect(kerala).toBeDefined();
    expect(kerala?.state).toBe('Kerala');
    expect(kerala?.year).toBe(2018);
  });

  it('filters disaster articles by search query', async () => {
    const res = await getDisasterArticles({ query: 'Assam' });
    expect(res.articles.length).toBeGreaterThan(0);
    expect(res.articles.every((a) =>
      a.title.toLowerCase().includes('assam') ||
      a.state.toLowerCase().includes('assam') ||
      a.description.toLowerCase().includes('assam')
    )).toBe(true);
  }, 15000);

  it('filters disaster articles by disaster type', async () => {
    const res = await getDisasterArticles({ disasterType: 'Cyclone' });
    expect(res.articles.length).toBeGreaterThan(0);
    expect(res.articles.every((a) => a.disasterType === 'Cyclone')).toBe(true);
  }, 15000);

  it('filters disaster articles by year range', async () => {
    const recent = await getDisasterArticles({ yearRange: '2024-2026' });
    expect(recent.articles.length).toBeGreaterThan(0);
    expect(recent.articles.every((a) => a.year >= 2024)).toBe(true);

    const hist = await getDisasterArticles({ yearRange: 'historical' });
    expect(hist.articles.length).toBeGreaterThan(0);
    expect(hist.articles.every((a) => a.year < 2020)).toBe(true);
  }, 15000);

  it('strictly filters out non-relevant entertainment news like Bigg Boss or Bollywood', () => {
    expect(isGenuineDisasterArticle('Bigg Boss 18 contestant elimination causes disaster inside house')).toBe(false);
    expect(isGenuineDisasterArticle('Bollywood movie trailer creates flood of comments on cinema page')).toBe(false);
    expect(isGenuineDisasterArticle('India cricket team scores massive win in storm match')).toBe(false);
    expect(isGenuineDisasterArticle('Trump discusses flood relief in campaign speech on US politics')).toBe(false);
    expect(isGenuineDisasterArticle('Assam Brahmaputra river water level breaches danger mark in flood alert')).toBe(true);
    expect(isGenuineDisasterArticle('Kerala heavy monsoon rain causes flash flood in Wayanad')).toBe(true);
  });

  it('parses GDACS API disaster reports correctly', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              eventid: 12345,
              episodeid: 1,
              eventtype: 'FL',
              name: 'Flood in India',
              htmldescription: 'Severe flood across Brahmaputra valley',
              fromdate: '2026-08-01T00:00:00',
              country: 'India',
              alertlevel: 'Orange',
              url: { report: 'https://www.gdacs.org/report' },
            },
          },
        ],
      }),
    } as any);

    const reports = await fetchGDACSDisasterReports();
    expect(reports.length).toBe(1);
    expect(reports[0].title).toContain('Flood Alert');
    expect(reports[0].disasterType).toBe('Flood');
    expect(reports[0].source).toContain('GDACS');
  });

  it('parses NASA EONET events within the Indian bounding box', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        events: [
          {
            id: 'EONET_1234',
            title: 'Assam Severe Flood Event',
            categories: [{ id: 'floods', title: 'Floods' }],
            geometry: [{ date: '2025-07-10T00:00:00Z', coordinates: [92.5, 26.2] }],
            sources: [{ id: 'NASA', url: 'https://nasa.gov' }],
          },
        ],
      }),
    } as any);

    const events = await fetchNASAEONETEvents();
    expect(events.length).toBe(1);
    expect(events[0].title).toBe('Assam Severe Flood Event');
    expect(events[0].source).toContain('NASA');
  });
});

describe('Historical Disaster Service (City Intelligence)', () => {
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
    expect(landslideCat).toBeUndefined();
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
