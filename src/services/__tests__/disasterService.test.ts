import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  HISTORICAL_INDIAN_DISASTERS,
  getDisasterArticles,
  fetchReliefWebDisasterReports,
  fetchNASAEONETEvents,
} from '../disasterService';

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
  });

  it('filters disaster articles by disaster type', async () => {
    const res = await getDisasterArticles({ disasterType: 'Cyclone' });
    expect(res.articles.length).toBeGreaterThan(0);
    expect(res.articles.every((a) => a.disasterType === 'Cyclone')).toBe(true);
  });

  it('filters disaster articles by year range', async () => {
    const recent = await getDisasterArticles({ yearRange: '2024-2026' });
    expect(recent.articles.length).toBeGreaterThan(0);
    expect(recent.articles.every((a) => a.year >= 2024)).toBe(true);

    const hist = await getDisasterArticles({ yearRange: 'historical' });
    expect(hist.articles.length).toBeGreaterThan(0);
    expect(hist.articles.every((a) => a.year < 2020)).toBe(true);
  });

  it('gracefully handles ReliefWeb API errors and falls back to historical records', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'));
    const result = await getDisasterArticles();
    expect(result.articles.length).toBeGreaterThanOrEqual(HISTORICAL_INDIAN_DISASTERS.length);
  });

  it('parses ReliefWeb API reports correctly', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 9999,
            fields: {
              title: 'India: Severe Floods In Bihar State - Situation Update',
              url: 'https://reliefweb.int/report/bihar-update',
              date: { created: '2025-08-15T00:00:00Z' },
              source: [{ name: 'UN OCHA' }],
            },
          },
        ],
      }),
    } as any);

    const reports = await fetchReliefWebDisasterReports();
    expect(reports.length).toBe(1);
    expect(reports[0].title).toContain('Bihar State');
    expect(reports[0].disasterType).toBe('Flood');
    expect(reports[0].state).toBe('Bihar');
    expect(reports[0].source).toBe('UN OCHA');
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
