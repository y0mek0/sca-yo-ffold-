import { describe, expect, it } from 'vitest';
import { findHbarThresholds } from './price-watcher-sandbox';

describe('findHbarThresholds (sandbox analysis)', () => {
  it('classifies the most recent published HBAR proof', () => {
    const result = findHbarThresholds([
      { sequenceNumber: '19', priceUsd: 0.108873, fetchedAt: '2026-09-30T11:59:47.842Z', hash: 'h1' },
      { sequenceNumber: '21', priceUsd: 0.109236, fetchedAt: '2026-09-30T12:09:22.327Z', hash: 'h2' },
      { sequenceNumber: '23', priceUsd: 0.108595, fetchedAt: '2026-09-30T12:11:20.042Z', hash: 'h3' },
      { sequenceNumber: '25', priceUsd: 0.108702, fetchedAt: '2026-09-30T12:12:40.888Z', hash: 'h4' }
    ]);

    expect(result.count).toBe(4);
    expect(result.min).toBeCloseTo(0.108595, 6);
    expect(result.max).toBeCloseTo(0.109236, 6);
    if (result.latest) {
      expect(result.latest.sequenceNumber).toBe('25');
      expect(result.latest.priceUsd).toBeCloseTo(0.108702, 6);
    } else {
      throw new Error('expected latest to be defined');
    }
  });

  it('returns zeroed result for empty history', () => {
    expect(findHbarThresholds([])).toEqual({
      count: 0,
      min: 0,
      max: 0,
      latest: null
    });
  });
});
