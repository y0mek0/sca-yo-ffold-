import { describe, expect, it } from 'vitest';
import { formatProofCount, type ProofCount } from './proof-count';

describe('formatProofCount', () => {
  it('returns "0 proofs" when there are none', () => {
    expect(formatProofCount({ total: 0, byKind: {} })).toBe('0 proofs on file');
  });

  it('uses singular form for one proof', () => {
    expect(formatProofCount({ total: 1, byKind: { research_claim: 1 } })).toBe('1 proof on file');
  });

  it('uses plural form for multiple proofs', () => {
    expect(formatProofCount({ total: 12, byKind: { research_claim: 8, ai_decision: 4 } })).toBe('12 proofs on file (8 research_claim, 4 ai_decision)');
  });

  it('omits kind breakdown when only one kind is present', () => {
    expect(formatProofCount({ total: 3, byKind: { ai_decision: 3 } })).toBe('3 proofs on file');
  });
});

describe('buildProofCount', () => {
  it('aggregates by kind from raw proofs', async () => {
    const { buildProofCount } = await import('./proof-count');
    const result = buildProofCount([
      { kind: 'research_claim', subjectId: 'a', subjectType: 'claim', digest: '1'.repeat(64), algorithm: 'sha256' },
      { kind: 'research_claim', subjectId: 'b', subjectType: 'claim', digest: '2'.repeat(64), algorithm: 'sha256' },
      { kind: 'ai_decision', subjectId: 'c', subjectType: 'decision', digest: '3'.repeat(64), algorithm: 'sha256' }
    ]);
    expect(result.total).toBe(3);
    expect(result.byKind.research_claim).toBe(2);
    expect(result.byKind.ai_decision).toBe(1);
  });
});
