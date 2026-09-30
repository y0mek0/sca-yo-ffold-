import { describe, expect, it } from 'vitest';
import { canonicalizeJson, hashCanonicalJson, normalizeProofEvent } from './proof-event';

describe('ProofEvent canonical hashing', () => {
  it('produces the same canonical JSON and hash for equivalent object key order', () => {
    const first = normalizeProofEvent({
      kind: 'research_claim',
      actor: { id: 'agent:researcher', type: 'ai_agent' },
      subject: { id: 'claim:hcs-proof-log', type: 'claim' },
      payload: {
        claim: 'HCS is used as a proof log, not a database.',
        sources: ['https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service']
      },
      metadata: {
        adapter: 'research-claim',
        network: 'testnet'
      }
    });

    const second = normalizeProofEvent({
      metadata: {
        network: 'testnet',
        adapter: 'research-claim'
      },
      payload: {
        sources: ['https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service'],
        claim: 'HCS is used as a proof log, not a database.'
      },
      subject: { type: 'claim', id: 'claim:hcs-proof-log' },
      actor: { type: 'ai_agent', id: 'agent:researcher' },
      kind: 'research_claim'
    });

    expect(canonicalizeJson(first)).toBe(canonicalizeJson(second));
    expect(hashCanonicalJson(first)).toEqual({
      algorithm: 'sha256',
      digest: hashCanonicalJson(second).digest
    });
    expect(hashCanonicalJson(first).digest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects undefined values because they are not stable proof material', () => {
    expect(() =>
      normalizeProofEvent({
        kind: 'ai_decision',
        actor: { id: 'agent:router', type: 'ai_agent' },
        subject: { id: 'decision:route', type: 'decision' },
        payload: { decision: undefined }
      })
    ).toThrow(/undefined/i);
  });
});
