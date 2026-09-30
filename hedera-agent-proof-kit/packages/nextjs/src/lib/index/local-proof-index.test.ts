import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildSampleProof } from '../proof/sample-proof';
import { LocalProofIndex } from './local-proof-index';

let tempDir: string | undefined;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('LocalProofIndex', () => {
  it('stores full off-chain events while keeping HCS messages separately hash-addressed', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-index-'));
    const index = new LocalProofIndex(join(tempDir, 'proofs.jsonl'));
    const sample = buildSampleProof('research_claim');

    await index.append(sample);
    const proofs = await index.list();

    expect(proofs).toHaveLength(1);
    expect(proofs[0].hash.digest).toBe(sample.hash.digest);
    expect(JSON.stringify(proofs[0].event)).toContain('sources');
    expect(JSON.stringify(proofs[0].hcsMessage)).not.toContain('sources');
  });
});
