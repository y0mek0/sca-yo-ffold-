import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { LocalProofIndex } from './local-proof-index';
import { createAiDecisionProofEvent } from '../adapters/ai-decision';

let tempDir: string | undefined;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('LocalProofIndex concurrent append', () => {
  it('preserves every entry when many appends happen at once', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'tracemark-concurrent-'));
    const file = join(tempDir, 'proofs.jsonl');
    const index = new LocalProofIndex(file);

    const N = 5;
    const samples = Array.from({ length: N }, (_, i) => createAiDecisionProofEvent({
      decision: 'approve',
      rationale: `concurrent proof ${i} ${Math.random()}`,
      actorId: `agent:concurrent-${i}`,
      subjectId: `decision:concurrent-${i}`
    }));
    await Promise.all(samples.map((sample) => index.append({ event: sample, hash: { algorithm: 'sha256', digest: sample.subject.id }, hcsMessage: { schemaVersion: 'tracemark.hcs.v1', eventSchemaVersion: 'tracemark.v1', kind: 'ai_decision', subject: sample.subject, hash: { algorithm: 'sha256', digest: sample.subject.id }, metadata: sample.metadata } })));

    const list = await index.list();
    expect(list).toHaveLength(N);
    expect(new Set(list.map((p) => p.event.subject.id)).size).toBe(N);
  });
});
