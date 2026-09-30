import { describe, expect, it } from 'vitest';
import { createAiDecisionProofEvent } from './ai-decision';
import { createDocumentProofEvent } from './document-office';
import { createResearchClaimProofEvent } from './research-claim';

describe('Core+ proof adapters', () => {
  it('normalizes a research claim with sources into a research_claim ProofEvent', () => {
    const event = createResearchClaimProofEvent({
      claim: 'HCS anchors the proof hash while evidence stays off-chain.',
      sources: ['https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service'],
      actorId: 'agent:researcher'
    });

    expect(event.kind).toBe('research_claim');
    expect(event.subject.type).toBe('claim');
    expect(event.metadata).toMatchObject({ adapter: 'research-claim' });
  });

  it('normalizes an AI decision into an ai_decision ProofEvent', () => {
    const event = createAiDecisionProofEvent({
      decision: 'approve',
      rationale: 'policy passed',
      actorId: 'agent:router',
      subjectId: 'decision:payment-policy'
    });

    expect(event.kind).toBe('ai_decision');
    expect(event.subject.type).toBe('decision');
    expect(event.metadata).toMatchObject({ adapter: 'ai-decision' });
  });

  it('normalizes a document hash into a document_hash ProofEvent without storing file bytes', () => {
    const event = createDocumentProofEvent({
      fileName: 'submission.pdf',
      mimeType: 'application/pdf',
      sha256: 'b'.repeat(64),
      actorId: 'user:demo'
    });

    expect(event.kind).toBe('document_hash');
    expect(event.subject.type).toBe('document');
    expect(JSON.stringify(event)).not.toContain('fileBytes');
  });
});
