import { buildSampleProof } from '../src/lib/proof/sample-proof';

const sample = buildSampleProof('research_claim');

console.log(JSON.stringify({
  mode: 'local-only',
  note: 'This sample builds the off-chain event and HCS-safe proof message. Stage 4 submits it to HCS.',
  event: sample.event,
  hash: sample.hash,
  hcsMessage: sample.hcsMessage
}, null, 2));
