import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type ResearchClaimInput = {
  claim: string;
  sources: string[];
  actorId: string;
  evidenceSummary?: string;
};

export function createResearchClaimProofEvent(input: ResearchClaimInput): ProofEvent {
  return normalizeProofEvent({
    kind: 'research_claim',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: { id: `claim:${input.claim.slice(0, 48).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, type: 'claim' },
    payload: {
      claim: input.claim,
      sources: input.sources,
      evidenceSummary: input.evidenceSummary ?? null
    },
    metadata: { adapter: 'research-claim' }
  });
}
