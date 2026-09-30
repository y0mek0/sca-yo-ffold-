import { isVersionAtLeast } from '../src/lib/doctor/version';

const requiredNode = '20.18.3';

const checks = [
  ['Node version', isVersionAtLeast(process.version, requiredNode), `${process.version} >= ${requiredNode}`],
  ['HEDERA_NETWORK', (process.env.HEDERA_NETWORK ?? 'testnet') === 'testnet', process.env.HEDERA_NETWORK ?? 'testnet'],
  ['HEDERA_OPERATOR_ID', Boolean(process.env.HEDERA_OPERATOR_ID), process.env.HEDERA_OPERATOR_ID ? 'set' : 'missing; demo mode'],
  ['HEDERA_OPERATOR_KEY', Boolean(process.env.HEDERA_OPERATOR_KEY), process.env.HEDERA_OPERATOR_KEY ? 'set' : 'missing; demo mode'],
  ['HEDERA_MIRROR_NODE_URL', true, process.env.HEDERA_MIRROR_NODE_URL ?? 'https://testnet.mirrornode.hedera.com']
] as const;

console.log('AgentProof HBAR Doctor');
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? 'OK ' : 'WARN'} ${name.padEnd(24)} ${detail}`);
}

if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
  console.log('\nDemo mode is allowed. Add .env.local values to submit real HCS proofs.');
}
