import { describe, it, expect } from 'vitest';
import {
  computeFloodStatus,
  computeTrend,
  computeCapacityUtilization,
  formatIST,
} from '../status';

describe('Flood Status Computation Logic', () => {
  const warningLevel = 50.0;
  const dangerLevel = 52.0;
  const hfl = 54.0;

  it('classifies Normal when level is strictly below warning level', () => {
    expect(computeFloodStatus({ level: 48.5, warningLevel, dangerLevel, hfl })).toBe('Normal');
    expect(computeFloodStatus({ level: 49.99, warningLevel, dangerLevel, hfl })).toBe('Normal');
  });

  it('classifies Above normal when level equals or exceeds warning level but below danger level', () => {
    // Exact threshold boundary
    expect(computeFloodStatus({ level: 50.0, warningLevel, dangerLevel, hfl })).toBe('Above normal');
    expect(computeFloodStatus({ level: 51.2, warningLevel, dangerLevel, hfl })).toBe('Above normal');
    expect(computeFloodStatus({ level: 51.99, warningLevel, dangerLevel, hfl })).toBe('Above normal');
  });

  it('classifies Severe when level equals or exceeds danger level but below HFL', () => {
    // Exact danger boundary
    expect(computeFloodStatus({ level: 52.0, warningLevel, dangerLevel, hfl })).toBe('Severe');
    expect(computeFloodStatus({ level: 53.5, warningLevel, dangerLevel, hfl })).toBe('Severe');
    expect(computeFloodStatus({ level: 53.99, warningLevel, dangerLevel, hfl })).toBe('Severe');
  });

  it('classifies Extreme when level equals or exceeds HFL', () => {
    // Exact HFL boundary
    expect(computeFloodStatus({ level: 54.0, warningLevel, dangerLevel, hfl })).toBe('Extreme');
    // Surpassing historical record
    expect(computeFloodStatus({ level: 55.2, warningLevel, dangerLevel, hfl })).toBe('Extreme');
  });

  it('handles missing or zero HFL gracefully', () => {
    // Without HFL, level above danger is Severe
    expect(computeFloodStatus({ level: 55.0, warningLevel, dangerLevel, hfl: null })).toBe('Severe');
    expect(computeFloodStatus({ level: 55.0, warningLevel, dangerLevel, hfl: 0 })).toBe('Severe');
  });

  it('handles NaN or invalid level gracefully', () => {
    expect(computeFloodStatus({ level: NaN, warningLevel, dangerLevel, hfl })).toBe('Normal');
  });
});

describe('Trend Direction Computation', () => {
  it('returns Steady when delta is within epsilon (0.02m)', () => {
    expect(computeTrend([50.10, 50.11])).toBe('Steady');
    expect(computeTrend([50.10, 50.09])).toBe('Steady');
    expect(computeTrend([50.10, 50.10])).toBe('Steady');
  });

  it('returns Rising when water level increases beyond epsilon', () => {
    expect(computeTrend([50.0, 50.05])).toBe('Rising');
    expect(computeTrend([49.0, 50.0, 50.25])).toBe('Rising');
  });

  it('returns Falling when water level decreases beyond epsilon', () => {
    expect(computeTrend([50.20, 50.15])).toBe('Falling');
    expect(computeTrend([51.0, 50.5, 50.3])).toBe('Falling');
  });

  it('returns Steady for single or empty observation arrays', () => {
    expect(computeTrend([])).toBe('Steady');
    expect(computeTrend([50.0])).toBe('Steady');
  });
});

describe('Capacity Utilization Percentage', () => {
  it('computes realistic percentage relative to highest reference level', () => {
    const pct = computeCapacityUtilization(50.0, 48.0, 52.0, 54.0);
    // 50 / 54 * 100 = 92.6%
    expect(pct).toBeCloseTo(92.6, 1);
  });

  it('clamps within safe ranges', () => {
    expect(computeCapacityUtilization(0, 10, 20, 30)).toBe(0);
    expect(computeCapacityUtilization(-5, 10, 20, 30)).toBe(0);
  });
});

describe('IST Date Formatting', () => {
  it('formats dates consistently in Indian Standard Time (Asia/Kolkata)', () => {
    const utcDate = new Date('2026-07-15T08:30:00Z');
    // UTC 08:30 + 05:30 IST = 14:00 (2:00 PM) on 15 Jul 2026
    const formatted = formatIST(utcDate);
    expect(formatted).toContain('Jul');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('02:00');
  });
});
