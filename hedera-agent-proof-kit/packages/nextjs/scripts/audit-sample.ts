import { formatCheck, formatHeadline, formatHint } from '../src/lib/cli/cli-output';
import { buildHcsProofMessage, hashCanonicalJson } from '../src/lib/proof/proof-event';
import { createResearchClaimProofEvent } from '../src/lib/adapters/research-claim';

const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

function main(): void {
  const event = createResearchClaimProofEvent({
    claim: 'HCS should be used as a proof log, not as a database.',
    sources: ['https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service'],
    actorId: 'agent:demo-researcher',
    evidenceSummary: 'Only the hash is anchored on HCS; full evidence stays off-chain.'
  });
  const hash = hashCanonicalJson(event);
  const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });

  console.log(formatHeadline('Research claim sample proof', { color }));
  console.log();
  console.log(formatCheck('Schema version', true, event.schemaVersion, { color }));
  console.log(formatCheck('Adapter', true, 'research-claim', { color }));
  console.log(formatCheck('Hash algorithm', true, hash.algorithm, { color }));
  console.log(formatCheck('Hash digest', true, hash.digest, { color }));
  console.log(formatCheck('HCS message size', true, `${JSON.stringify(hcsMessage).length} bytes (raw payload omitted)`, { color }));
  console.log();
  console.log(formatHint('Run npm run verify:sample to recompute the hash.', { color }));
}

main();
