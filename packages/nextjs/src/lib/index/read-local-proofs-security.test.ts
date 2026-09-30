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

describe('readLocalProofs security smoke', () => {
  it('ignores corrupt lines without throwing', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-corrupt-'));
    const file = join(tempDir, 'proofs.jsonl');
    const good = JSON.stringify({ event: { subject: { id: 'a', type: 'b' }, kind: 'k' }, hash: { algorithm: 'sha256', digest: '1'.repeat(64) }, hcsMessage: { subject: { id: 'a', type: 'b' }, kind: 'k', hash: { algorithm: 'sha256', digest: '1'.repeat(64) } } });
    await writeFile(file, `${good}\n{not json\n${good}\n`, 'utf8');

    const proofs = await readLocalProofs(file);
    expect(proofs).toHaveLength(2);
    expect(proofs[0].digest).toBe('1'.repeat(64));
  });

  it('does not leak raw payload fields', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-leak-'));
    const file = join(tempDir, 'proofs.jsonl');
    const secret = 'SECRET_PRIVATE_VALUE_0xabcdef0123456789';
    const record = {
      event: { kind: 'k', subject: { id: 's', type: 't' }, payload: { secret } },
      hash: { algorithm: 'sha256', digest: 'a'.repeat(64) },
      hcsMessage: { kind: 'k', subject: { id: 's', type: 't' }, hash: { algorithm: 'sha256', digest: 'a'.repeat(64) } }
    };
    await writeFile(file, `${JSON.stringify(record)}\n`, 'utf8');

    const proofs = await readLocalProofs(file);
    expect(JSON.stringify(proofs)).not.toContain(secret);
    expect(JSON.stringify(proofs)).not.toContain('payload');
  });

  it('handles a very large file by reading up to bound', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-large-'));
    const file = join(tempDir, 'proofs.jsonl');
    const lines: string[] = [];
    for (let i = 0; i < 5_000; i += 1) {
      lines.push(JSON.stringify({
        event: { kind: 'k', subject: { id: `s${i}`, type: 't' } },
        hash: { algorithm: 'sha256', digest: String(i).padStart(64, '0') },
        hcsMessage: { kind: 'k', subject: { id: `s${i}`, type: 't' }, hash: { algorithm: 'sha256', digest: String(i).padStart(64, '0') } }
      }));
    }
    await writeFile(file, `${lines.join('\n')}\n`, 'utf8');

    const start = Date.now();
    const proofs = await readLocalProofs(file);
    const elapsedMs = Date.now() - start;

    expect(proofs).toHaveLength(5_000);
    expect(proofs[0].digest).toBe('4999'.padStart(64, '0'));
    expect(proofs[proofs.length - 1].digest).toBe('0000'.padStart(64, '0'));
    expect(elapsedMs).toBeLessThan(2_000);
  });

  it('handles an empty file', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-empty-'));
    const file = join(tempDir, 'proofs.jsonl');
    await writeFile(file, '', 'utf8');

    expect(await readLocalProofs(file)).toEqual([]);
  });

  it('handles a file that contains only whitespace and blank lines', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-blank-'));
    const file = join(tempDir, 'proofs.jsonl');
    await writeFile(file, '\n\n   \n', 'utf8');

    expect(await readLocalProofs(file)).toEqual([]);
  });

  it('does not crash when entries are missing fields', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agentproof-missing-'));
    const file = join(tempDir, 'proofs.jsonl');
    await writeFile(file, `${JSON.stringify({})}\n${JSON.stringify({ event: null })}\n`, 'utf8');

    const proofs = await readLocalProofs(file);
    expect(proofs).toHaveLength(2);
    expect(proofs[0].kind).toBe('unknown');
  });
});
