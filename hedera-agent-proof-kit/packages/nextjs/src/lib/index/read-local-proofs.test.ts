import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readLocalProofs } from './read-local-proofs';

let tempDir: string | undefined;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('readLocalProofs', () => {
  it('returns an empty array when no index file exists yet', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-read-'));
    expect(await readLocalProofs(join(tempDir, 'proofs.jsonl'))).toEqual([]);
  });

  it('returns newest-first proof summaries without leaking raw payload fields', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-read-'));
    const file = join(tempDir, 'proofs.jsonl');
    const first = {
      event: {
        schemaVersion: 'agentproof.v1',
        kind: 'research_claim',
        actor: { id: 'agent:a', type: 'ai_agent' },
        subject: { id: 'claim:a', type: 'claim' },
        payload: { claim: 'first', sources: ['secret-source-url'] },
        metadata: { adapter: 'research-claim' }
      },
      hash: { algorithm: 'sha256', digest: '1'.repeat(64) },
      hcsMessage: {
        schemaVersion: 'agentproof.hcs.v1',
        eventSchemaVersion: 'agentproof.v1',
        kind: 'research_claim',
        subject: { id: 'claim:a', type: 'claim' },
        hash: { algorithm: 'sha256', digest: '1'.repeat(64) },
        metadata: { adapter: 'research-claim' }
      }
    };
    const second = {
      ...first,
      event: { ...first.event, subject: { id: 'claim:b', type: 'claim' }, payload: { claim: 'second', sources: ['other-source'] } },
      hash: { algorithm: 'sha256', digest: '2'.repeat(64) },
      hcsMessage: { ...first.hcsMessage, subject: { id: 'claim:b', type: 'claim' }, hash: { algorithm: 'sha256', digest: '2'.repeat(64) } }
    };
    await writeFile(file, `${JSON.stringify(first)}\n${JSON.stringify(second)}\n`, 'utf8');

    const proofs = await readLocalProofs(file);

    expect(proofs).toHaveLength(2);
    expect(proofs[0].digest).toBe('2'.repeat(64));
    expect(proofs[1].digest).toBe('1'.repeat(64));
    for (const proof of proofs) {
      expect(JSON.stringify(proof)).not.toContain('secret-source-url');
      expect(JSON.stringify(proof)).not.toContain('other-source');
    }
  });
});
