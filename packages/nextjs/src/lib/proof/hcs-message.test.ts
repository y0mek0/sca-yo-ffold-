import { describe, expect, it } from 'vitest';
import { buildHcsProofMessage, hashCanonicalJson, normalizeProofEvent } from './proof-event';

describe('HCS proof message envelope', () => {
  it('contains only hash metadata and never stores the raw payload on HCS', () => {
    const event = normalizeProofEvent({
      kind: 'document_hash',
      actor: { id: 'user:demo', type: 'user' },
      subject: { id: 'document:submission-deck', type: 'document' },
      payload: {
        fileName: 'deck.pdf',
        sha256: 'a'.repeat(64),
        privateNote: 'this should stay off-chain'
      },
      metadata: { adapter: 'document-office' }
    });

    const eventHash = hashCanonicalJson(event);
    const message = buildHcsProofMessage({ event, eventHash });
    const serialized = JSON.stringify(message);

    expect(message).toEqual({
      schemaVersion: 'tracemark.hcs.v1',
      eventSchemaVersion: 'tracemark.v1',
      kind: 'document_hash',
      subject: { id: 'document:submission-deck', type: 'document' },
      hash: eventHash,
      metadata: { adapter: 'document-office' }
    });
    expect(serialized).not.toContain('this should stay off-chain');
    expect(serialized).not.toContain('deck.pdf');
  });
});
