import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type RagMemoryInput = {
  question: string;
  answer: string;
  chunksSha256: string[];
  retriever: string;
  actorId: string;
};

export function createRagMemoryProofEvent(input: RagMemoryInput): ProofEvent {
  return normalizeProofEvent({
    kind: 'research_claim',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: {
      id: `rag:${input.retriever}`,
      type: 'rag_memory'
    },
    payload: {
      question: input.question,
      answer: input.answer,
      chunksSha256: input.chunksSha256,
      retriever: input.retriever
    },
    metadata: { adapter: 'rag-memory' }
  });
}
