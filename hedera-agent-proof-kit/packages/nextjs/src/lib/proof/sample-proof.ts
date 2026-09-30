import {
  buildHcsProofMessage,
  hashCanonicalJson,
  normalizeProofEvent,
  type HcsProofMessage,
  type ProofEvent,
  type ProofEventKind,
  type ProofHash
} from './proof-event';

export type SampleProof = {
  event: ProofEvent;
  hash: ProofHash;
  hcsMessage: HcsProofMessage;
};

export function buildSampleProof(kind: ProofEventKind = 'research_claim'): SampleProof {
  const event = normalizeProofEvent({
    kind,
    actor: { id: 'agent:demo-researcher', type: 'ai_agent' },
    subject: { id: 'claim:hcs-proof-log', type: 'claim' },
    payload: {
      claim: 'HCS should be used as a proof log, not as a database.',
      sources: ['https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service'],
      evidenceSummary: 'Only the hash is anchored on HCS; full evidence stays off-chain.'
    },
    metadata: {
      adapter: 'research-claim',
      network: 'testnet',
      demo: true
    }
  });
  const hash = hashCanonicalJson(event);
  const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });

  return { event, hash, hcsMessage };
}
