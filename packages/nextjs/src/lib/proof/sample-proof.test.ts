import { describe, expect, it } from 'vitest';
import { buildSampleProof } from './sample-proof';

describe('buildSampleProof', () => {
  it('builds an off-chain event plus an HCS-safe message for the default research claim sample', () => {
    const sample = buildSampleProof('research_claim');

    expect(sample.event.kind).toBe('research_claim');
    expect(sample.hash.digest).toMatch(/^[a-f0-9]{64}$/);
    expect(sample.hcsMessage.hash.digest).toBe(sample.hash.digest);
    expect(JSON.stringify(sample.hcsMessage)).not.toContain('sources');
    expect(JSON.stringify(sample.event)).toContain('sources');
  });

  it('builds samples for all working Core+ adapters', () => {
    expect(buildSampleProof('research_claim').event.metadata).toMatchObject({ adapter: 'research-claim' });
    expect(buildSampleProof('ai_decision').event.metadata).toMatchObject({ adapter: 'ai-decision' });
    expect(buildSampleProof('document_hash').event.metadata).toMatchObject({ adapter: 'document-office' });
  });
});
