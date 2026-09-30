import { describe, expect, it } from 'vitest';
import { buildSampleProof } from './sample-proof';
import { verifyLocalProof } from './verify-proof';

describe('verifyLocalProof', () => {
  it('passes when the off-chain event hash matches the HCS message hash', () => {
    const sample = buildSampleProof('research_claim');

    expect(verifyLocalProof(sample)).toEqual({ ok: true, reason: 'hash_match' });
  });

  it('fails when the off-chain event payload is changed after proof creation', () => {
    const sample = buildSampleProof('research_claim');
    const tampered = {
      ...sample,
      event: {
        ...sample.event,
        payload: { changed: true }
      }
    };

    expect(verifyLocalProof(tampered)).toEqual({ ok: false, reason: 'hash_mismatch' });
  });
});
