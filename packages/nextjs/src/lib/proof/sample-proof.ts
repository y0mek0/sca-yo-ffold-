import { createAiDecisionProofEvent } from '../adapters/ai-decision';
import { createDocumentProofEvent } from '../adapters/document-office';
import { createResearchClaimProofEvent } from '../adapters/research-claim';
import {
  buildHcsProofMessage,
  hashCanonicalJson,
  type HcsProofMessage,
  type ProofEvent,
  type ProofEventKind,
  type ProofHash
} from './proof-event';

export type SampleProof = {
  event: ProofEvent;
  hash: ProofHash;
  hcsMessage: HcsProofMessage;
};

function createSampleEvent(kind: ProofEventKind): ProofEvent {
  if (kind === 'ai_decision') {
    return createAiDecisionProofEvent({
      decision: 'approve',
      rationale: 'The request passes the demo policy and can be anchored as a proof.',
      actorId: 'agent:demo-router',
      subjectId: 'decision:demo-policy',
      confidence: 0.91
    });
  }

  if (kind === 'document_hash') {
    return createDocumentProofEvent({
      fileName: 'submission-deck.pdf',
      mimeType: 'application/pdf',
      sha256: 'b'.repeat(64),
      actorId: 'user:demo'
    });
  }

  return createResearchClaimProofEvent({
    claim: 'HCS should be used as a proof log, not as a database.',
    sources: ['https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service'],
    actorId: 'agent:demo-researcher',
    evidenceSummary: 'Only the hash is anchored on HCS; full evidence stays off-chain.'
  });
}

export function buildSampleProof(kind: ProofEventKind = 'research_claim'): SampleProof {
  const event = createSampleEvent(kind);
  const hash = hashCanonicalJson(event);
  const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });

  return { event, hash, hcsMessage };
}
