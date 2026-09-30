import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type AiDecisionInput = {
  decision: string;
  rationale: string;
  actorId: string;
  subjectId: string;
  confidence?: number;
};

export function createAiDecisionProofEvent(input: AiDecisionInput): ProofEvent {
  return normalizeProofEvent({
    kind: 'ai_decision',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: { id: input.subjectId, type: 'decision' },
    payload: {
      decision: input.decision,
      rationale: input.rationale,
      confidence: input.confidence ?? null
    },
    metadata: { adapter: 'ai-decision' }
  });
}
