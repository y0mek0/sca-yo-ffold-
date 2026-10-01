import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadHederaEnv } from './hedera-env';

let tempDir: string | undefined;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('loadHederaEnv', () => {
  it('loads .env.local without printing secrets and accepts HEDERA_TOPIC_ID', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'tracemark-env-'));
    await writeFile(join(tempDir, '.env.local'), [
      'HEDERA_NETWORK=testnet',
      'HEDERA_OPERATOR_ID=0.0.123',
      'HEDERA_OPERATOR_KEY=0xabcdef',
      'HEDERA_TOPIC_ID=0.0.456',
      'HEDERA_MIRROR_NODE_URL=https://mirror.example'
    ].join('\n'));

    expect(loadHederaEnv(tempDir)).toEqual({
      network: 'testnet',
      operatorId: '0.0.123',
      operatorKey: '0xabcdef',
      topicId: '0.0.456',
      mirrorNodeUrl: 'https://mirror.example'
    });
  });

  it('also accepts legacy HEDERA_HCS_TOPIC_ID', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'tracemark-env-'));
    await writeFile(join(tempDir, '.env.local'), [
      'HEDERA_OPERATOR_ID=0.0.123',
      'HEDERA_OPERATOR_KEY=302e020100',
      'HEDERA_HCS_TOPIC_ID=0.0.789'
    ].join('\n'));

    expect(loadHederaEnv(tempDir).topicId).toBe('0.0.789');
  });

  it('finds .env.local in a parent workspace directory', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'tracemark-env-'));
    const childDir = join(tempDir, 'packages', 'nextjs');
    await writeFile(join(tempDir, '.env.local'), [
      'HEDERA_OPERATOR_ID=0.0.123',
      'HEDERA_OPERATOR_KEY=302e020100',
      'HEDERA_TOPIC_ID=0.0.999'
    ].join('\n'));

    expect(loadHederaEnv(childDir).topicId).toBe('0.0.999');
  });
});
