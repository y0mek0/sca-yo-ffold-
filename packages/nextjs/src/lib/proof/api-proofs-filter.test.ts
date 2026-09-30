import { describe, expect, it } from 'vitest';
import { filterAndLimitProofs, type ApiQuery } from './api-proofs-filter';

const fixture = [
  { kind: 'research_claim', subjectId: 'a', subjectType: 'claim', digest: '1'.repeat(64), algorithm: 'sha256' as const, adapter: 'research-claim' },
  { kind: 'ai_decision', subjectId: 'b', subjectType: 'decision', digest: '2'.repeat(64), algorithm: 'sha256' as const, adapter: 'ai-decision' },
  { kind: 'research_claim', subjectId: 'c', subjectType: 'claim', digest: '3'.repeat(64), algorithm: 'sha256' as const, adapter: 'research-claim' }
];

describe('filterAndLimitProofs', () => {
  it('filters by kind', () => {
    const out = filterAndLimitProofs(fixture, { kind: 'research_claim' });
    expect(out).toHaveLength(2);
    expect(out.every((p) => p.kind === 'research_claim')).toBe(true);
  });

  it('clamps the limit to [1, 100]', () => {
    expect(filterAndLimitProofs(fixture, { limit: '0' })).toHaveLength(1);
    expect(filterAndLimitProofs(fixture, { limit: '1000' }).length).toBeLessThanOrEqual(100);
  });

  it('returns everything when no query', () => {
    expect(filterAndLimitProofs(fixture, {})).toHaveLength(3);
  });

  it('combines kind and limit', () => {
    const out = filterAndLimitProofs(fixture, { kind: 'research_claim', limit: '1' });
    expect(out).toHaveLength(1);
  });
});
