import { formatError, formatHeadline, formatSuccess } from '../src/lib/cli/cli-output';
import { verifyLocalProof } from '../src/lib/proof/verify-proof';
import { buildSampleProof } from '../src/lib/proof/sample-proof';

const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

function main(): void {
  const sample = buildSampleProof('research_claim');
  const result = verifyLocalProof(sample);

  console.log(formatHeadline('Verify sample proof', { color }));
  console.log();
  if (result.ok) {
    console.log(formatSuccess(`Local hash matches HCS message hash (${sample.hash.digest.slice(0, 12)}...)`, { color }));
  } else {
    console.log(formatError('Local hash mismatch', { kind: 'verify', reason: result.reason }, { color }));
    process.exitCode = 1;
  }
}

main();
