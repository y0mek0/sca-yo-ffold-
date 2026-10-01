import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { formatCheck, formatHeadline, formatHint } from '../src/lib/cli/cli-output';
import { describeHederaKey, parseHederaAccountId } from '../src/lib/doctor/key-parser';
import { buildProofCount, formatProofCount } from '../src/lib/doctor/proof-count';
import { checkTokenAssociation } from '../src/lib/doctor/token-association';
import { readLocalProofs } from '../src/lib/index/read-local-proofs';
import { resolveProofIndexPath } from '../src/lib/index/proof-index-path';
import { isVersionAtLeast } from '../src/lib/doctor/version';

function loadDotEnvLocal(): void {
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const candidate = join(dir, '.env.local');
    if (existsSync(candidate)) {
      const text = readFileSync(candidate, 'utf8');
      const lines = text.split(/\r\n|\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const index = trimmed.indexOf('=');
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
        if (process.env[key] === undefined) process.env[key] = value;
      }
      return;
    }
    const parent = dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

loadDotEnvLocal();

const requiredNode = '20.18.3';
const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

type Check = [name: string, ok: boolean, detail: string];

async function main(): Promise<void> {
  const checks: Check[] = [
    ['Node version', isVersionAtLeast(process.version, requiredNode), `${process.version} >= ${requiredNode}`],
    [
      'HEDERA_NETWORK',
      (process.env.HEDERA_NETWORK ?? 'testnet') === 'testnet',
      process.env.HEDERA_NETWORK ?? 'testnet'
    ],
    [
      'HEDERA_OPERATOR_ID',
      Boolean(process.env.HEDERA_OPERATOR_ID),
      process.env.HEDERA_OPERATOR_ID ? 'set' : 'missing; demo mode'
    ]
  ];

  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const operatorId = process.env.HEDERA_OPERATOR_ID;

  if (operatorId) {
    try {
      parseHederaAccountId(operatorId);
      checks.push(['HEDERA_OPERATOR_ID shape', true, `parsed ${operatorId}`]);
    } catch (error) {
      checks.push([
        'HEDERA_OPERATOR_ID shape',
        false,
        error instanceof Error ? error.message : 'unable to parse account id'
      ]);
    }
  }

  checks.push([
    'HEDERA_OPERATOR_KEY',
    Boolean(operatorKey),
    operatorKey ? 'set' : 'missing; demo mode'
  ]);

  if (operatorKey) {
    try {
      const description = describeHederaKey(operatorKey);
      checks.push(['Key format', true, `${description.format} (${description.normalized.slice(0, 12)}...)`]);
    } catch (error) {
      checks.push([
        'Key format',
        false,
        error instanceof Error ? error.message : 'unable to parse operator key'
      ]);
    }
  }

  checks.push([
    'HEDERA_MIRROR_NODE_URL',
    true,
    process.env.HEDERA_MIRROR_NODE_URL ?? 'https://testnet.mirrornode.hedera.com'
  ]);

  const tokenId = process.env.HEDERA_PROOF_TOKEN_ID ?? '0.0.429274';
  const mirrorNodeUrl = process.env.HEDERA_MIRROR_NODE_URL ?? 'https://testnet.mirrornode.hedera.com';

  if (operatorId) {
    const result = await checkTokenAssociation({ accountId: operatorId, tokenId, mirrorNodeUrl });
    checks.push([
      'Token association',
      result.ok,
      result.ok ? `${tokenId} associated` : result.reason
    ]);
  }

  const proofs = await readLocalProofs(resolveProofIndexPath());
  const proofCount = buildProofCount(proofs);
  checks.push(['Local proof index', true, formatProofCount(proofCount)]);

  console.log(formatHeadline('Tracemark Doctor', { color }));
  console.log();
  for (const [name, ok, detail] of checks) {
    console.log(formatCheck(name, ok, detail, { color }));
  }
  console.log();

  if (!operatorId || !operatorKey) {
    console.log(formatHint('Demo mode is allowed. Add .env.local values to submit real HCS proofs.', { color }));
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
