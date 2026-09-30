import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type DocumentProofInput = {
  fileName: string;
  mimeType: string;
  sha256: string;
  actorId: string;
};

export function createDocumentProofEvent(input: DocumentProofInput): ProofEvent {
  return normalizeProofEvent({
    kind: 'document_hash',
    actor: { id: input.actorId, type: 'user' },
    subject: { id: `document:${input.fileName}`, type: 'document' },
    payload: {
      fileName: input.fileName,
      mimeType: input.mimeType,
      sha256: input.sha256
    },
    metadata: { adapter: 'document-office' }
  });
}
