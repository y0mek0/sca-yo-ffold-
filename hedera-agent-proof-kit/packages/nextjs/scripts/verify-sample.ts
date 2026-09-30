import { buildSampleProof } from '../src/lib/proof/sample-proof';
import { verifyLocalProof } from '../src/lib/proof/verify-proof';

const sample = buildSampleProof('research_claim');
const result = verifyLocalProof(sample);

console.log(JSON.stringify({
  mode: 'local-only',
  note: 'This recomputes the off-chain event hash and compares it with the HCS-safe message hash. Stage 4 replaces this sample message with Mirror Node data.',
  result,
  digest: sample.hash.digest
}, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
