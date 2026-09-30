import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type HederaEnv = {
  network: 'testnet';
  operatorId: string;
  operatorKey: string;
  topicId: string;
  mirrorNodeUrl: string;
};

function findEnvFile(startDir: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 6; i += 1) {
    const candidate = join(dir, '.env.local');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
  return undefined;
}

function parseEnvFile(path: string): Record<string, string> {
  if (!path || !existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
      })
  );
}

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function loadHederaEnv(cwd = process.cwd()): HederaEnv {
  const fileValues = parseEnvFile(findEnvFile(cwd) ?? join(cwd, '.env.local'));
  const env = { ...fileValues, ...process.env };

  return {
    network: 'testnet',
    operatorId: required(env.HEDERA_OPERATOR_ID, 'HEDERA_OPERATOR_ID'),
    operatorKey: required(env.HEDERA_OPERATOR_KEY, 'HEDERA_OPERATOR_KEY'),
    topicId: required(env.HEDERA_TOPIC_ID ?? env.HEDERA_HCS_TOPIC_ID, 'HEDERA_TOPIC_ID'),
    mirrorNodeUrl: env.HEDERA_MIRROR_NODE_URL ?? 'https://testnet.mirrornode.hedera.com'
  };
}
